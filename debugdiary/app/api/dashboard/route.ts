import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response('Unauthorized', { status: 401 })

    const entrySelect = {
        id: true,
        errorText: true,
        fixText: true,
        summary: true,
        language: true,
        framework: true,
        errorType: true,
        tags: true,
        difficulty: true,
        aiEnriched: true,
        source: true,
        createdAt: true,
        updatedAt: true,
        occurrences: true,
        lastSeenAt: true
    }

    const [entries, recentEntries] = await Promise.all([
        prisma.entry.findMany({
            where: { userId: user.id },
            select: entrySelect
        }),
        prisma.entry.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: entrySelect
        })
    ])

    // Process stats
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const thisWeekEntries = entries.filter((e: any) => e.createdAt > lastWeek)
    const aiEnriched = entries.filter((e: any) => e.aiEnriched).length

    // Calculate Streak
    // Sort entries by date descending to find consecutive days
    const sortedDates = [...entries]
        .map(e => new Date(e.createdAt.toDateString()).getTime())
        .sort((a, b) => b - a)

    // Remove duplicate days
    const uniqueDays = Array.from(new Set(sortedDates))

    let streak = 0
    const todayNum = new Date(now.toDateString()).getTime()
    const msInDay = 24 * 60 * 60 * 1000

    if (uniqueDays.length > 0) {
        let currentExpectedDay = todayNum

        // If they haven't logged today, check if they logged yesterday
        if (uniqueDays[0] !== todayNum) {
            if (uniqueDays[0] === todayNum - msInDay) {
                currentExpectedDay = todayNum - msInDay
            } else {
                streak = 0
            }
        }

        if (streak !== 0 || uniqueDays[0] === todayNum || uniqueDays[0] === todayNum - msInDay) {
            for (const day of uniqueDays) {
                if (day === currentExpectedDay) {
                    streak++
                    currentExpectedDay -= msInDay
                } else {
                    break
                }
            }
        }
    }


    const byLanguageMap = entries.reduce((acc: Record<string, number>, curr: any) => {
        if (curr.language && curr.language.toLowerCase() !== 'none') {
            acc[curr.language] = (acc[curr.language] || 0) + 1
        }
        return acc
    }, {})

    const byErrorTypeMap = entries.reduce((acc: Record<string, number>, curr: any) => {
        if (curr.errorType) {
            acc[curr.errorType] = (acc[curr.errorType] || 0) + 1
        }
        return acc
    }, {})

    const languagesCount = Object.keys(byLanguageMap).length
    const topLanguage = Object.entries(byLanguageMap).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'None'
    const topErrorType = Object.entries(byErrorTypeMap).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'None'

    // Format for Recharts: [{name, value}]
    const byLanguage = Object.entries(byLanguageMap).map(([name, value]) => ({ language: name, count: value }))
        .sort((a: any, b: any) => b.count - a.count)
    const byErrorType = Object.entries(byErrorTypeMap).map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)

    // Calculate Activity Grid (last 84 days)
    const activityGrid: Record<string, number> = {}
    const gridStart = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000)

    entries.forEach((e: any) => {
        if (e.createdAt >= gridStart) {
            const dateStr = e.createdAt.toISOString().split('T')[0]
            activityGrid[dateStr] = (activityGrid[dateStr] || 0) + 1
        }
    })

    // Recurring errors stats
    const recurringErrors = await prisma.entry.count({
        where: { userId: user.id, occurrences: { gt: 1 } }
    })

    const mostRecurring = await prisma.entry.findMany({
        where: { userId: user.id, occurrences: { gt: 1 } },
        orderBy: { occurrences: 'desc' },
        take: 3,
        select: {
            id: true,
            errorText: true,
            occurrences: true,
            lastSeenAt: true,
            errorType: true,
            affectedUrls: true
        }
    })

    return NextResponse.json({
        stats: {
            total: entries.length,
            thisWeek: thisWeekEntries.length,
            aiEnriched: aiEnriched,
            streak,
            languages: languagesCount,
            topLanguage,
            topErrorType,
            recurringErrors
        },
        byLanguage,
        byErrorType,
        recentEntries,
        activityGrid,
        mostRecurring
    }, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
    })
}


