import { prisma } from '@/lib/prisma'
import { sendDigest } from '@/lib/digest'

export async function runScheduledDigests() {
    const now = new Date()

    const users = await prisma.user.findMany({
        where: { emailAlerts: true },
        select: {
            id: true,
            timezone: true,
            lastMorningDigest: true,
            lastEveningDigest: true
        }
    })

    let sent = 0

    for (const user of users) {
        const timezone = user.timezone || 'Asia/Kolkata'

        // Get current hour in user's local timezone
        const localHour = parseInt(
            new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: 'numeric',
                hour12: false
            }).format(now)
        )

        // Morning digest at 8am local
        if (localHour === 8) {
            const alreadySent = user.lastMorningDigest
                && (now.getTime() - user.lastMorningDigest.getTime()) < 60 * 60 * 1000

            if (!alreadySent) {
                try {
                    await sendDigest(user.id, 'morning')
                    sent++
                    await new Promise(r => setTimeout(r, 500))
                } catch (err) {
                    console.error(`Morning digest failed for ${user.id}:`, err)
                }
            }
        }

        // Evening digest at 10pm (hour 22) local
        if (localHour === 22) {
            const alreadySent = user.lastEveningDigest
                && (now.getTime() - user.lastEveningDigest.getTime()) < 60 * 60 * 1000

            if (!alreadySent) {
                try {
                    await sendDigest(user.id, 'evening')
                    sent++
                    await new Promise(r => setTimeout(r, 500))
                } catch (err) {
                    console.error(`Evening digest failed for ${user.id}:`, err)
                }
            }
        }
    }

    return { processed: users.length, sent, time: now.toISOString() }
}
