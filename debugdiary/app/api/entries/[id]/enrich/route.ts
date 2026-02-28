import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { enrichEntry, generateEmbedding } from '@/lib/gemini'

// POST /api/entries/[id]/enrich
// Called by the client-side poller when it detects aiEnriched: false.
// This ensures enrichment always completes even if the background task
// on the capture endpoint was killed by Vercel's serverless timeout.
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch the entry — must belong to this user
    const entry = await prisma.entry.findUnique({
        where: { id },
        select: {
            id: true,
            errorText: true,
            fixText: true,
            aiEnriched: true,
            userId: true
        }
    })

    if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Verify ownership
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    if (!user || entry.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Skip if already enriched
    if (entry.aiEnriched) {
        return NextResponse.json({ already: true })
    }

    try {
        const enriched = await enrichEntry(
            entry.errorText,
            entry.fixText || '',
            undefined
        )

        const embedding = await generateEmbedding(
            entry.errorText + ' ' + (entry.fixText || '')
        )

        await prisma.entry.update({
            where: { id },
            data: { ...enriched, embedding, aiEnriched: true }
        })

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('[Enrich] failed:', err)
        return NextResponse.json({ error: err?.message || 'Enrichment failed' }, { status: 500 })
    }
}
