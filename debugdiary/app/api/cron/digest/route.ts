import { runScheduledDigests } from '@/lib/digestScheduler'

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 })
    }

    // Allow cron to pass type explicitly to bypass time check
    // This is needed because GitHub Actions can delay cron by 1-2 hours
    const { searchParams } = new URL(req.url)
    const forceType = searchParams.get('type') as 'morning' | 'evening' | null

    const result = await runScheduledDigests(forceType)

    return Response.json({ success: true, ...result })
}
