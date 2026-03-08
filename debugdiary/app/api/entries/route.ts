import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { sanitizeEntry } from '@/lib/sanitize'
import { enrichEntry, generateEmbedding } from '@/lib/gemini'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { searchParams } = new URL(req.url)
    const lang = searchParams.get('lang')
    const tag = searchParams.get('tag')
    const projectId = searchParams.get('projectId')
    const source = searchParams.get('source')

    const entries = await prisma.entry.findMany({
        where: {
            userId: user.id,
            ...(projectId === 'unassigned' ? { projectId: null } : projectId ? { projectId } : {}),
            ...(source === 'manual' ? { source: { in: ['manual', 'web'] } } : source === 'sdk_js' ? { source: { in: ['sdk_js', 'sdk'] } } : source ? { source } : {}),
            ...(lang && { language: { equals: lang, mode: 'insensitive' } }),
            ...(tag && {
                OR: [
                    { errorType: { contains: tag, mode: 'insensitive' } },
                    { tags: { has: tag.toLowerCase() } },
                    { tags: { has: tag } }
                ]
            })
        },
        orderBy: { createdAt: 'desc' },
        select: {
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
            project: { select: { id: true, name: true } },
            createdAt: true,
            updatedAt: true,
            occurrences: true,
            affectedUrls: true,
            firstSeenAt: true,
            lastSeenAt: true,
            fileContext: true
        }
    })

    return Response.json(entries)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response('Unauthorized', { status: 401 })

    const body = await req.json()
    const { errorText, fixText, codeSnippet, notes } = body

    const sanitized = sanitizeEntry({
        errorText,
        fixText,
        stackTrace: codeSnippet,
        notes
    })

    const entry = await prisma.entry.create({
        data: {
            userId: user.id,
            errorText: sanitized.errorText || errorText,
            fixText: sanitized.fixText || fixText,
            codeSnippet: sanitized.stackTrace || codeSnippet,
            context: sanitized.notes || notes,
            aiEnriched: false,
            source: 'manual'
        }
    })

    // Background processing
    enrichEntry(errorText, fixText, codeSnippet)
        .then(async (enriched) => {
            const embedding = await generateEmbedding(errorText + ' ' + fixText)
            await prisma.entry.update({
                where: { id: entry.id },
                data: {
                    ...enriched,
                    embedding: embedding,
                    aiEnriched: true
                }
            })
        })
        .catch(console.error)

    return Response.json(entry)
}
