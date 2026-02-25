import { prisma } from '@/lib/prisma'
import { authenticateExtension } from '../auth'

export async function POST(req: Request) {
    const user = await authenticateExtension(req)
    if (!user) return new Response('Unauthorized', { status: 401 })

    const body = await req.json()
    const { errorText, fixText, codeSnippet, context } = body

    if (!errorText || !fixText) {
        return new Response('Missing required fields', { status: 400 })
    }

    const entry = await prisma.entry.create({
        data: {
            userId: user.id,
            errorText,
            fixText,
            codeSnippet,
            context,
            source: 'vscode',
            // Truncate to first 60 chars for a default summary until AI enriches
            summary: errorText.length > 60 ? errorText.substring(0, 60) + '...' : errorText,
            embedding: [] // Start empty, background job will populate
        }
    })

    // Trigger background enrichment silently
    try {
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/entries/${entry.id}/enrich`, {
            method: 'POST'
        }).catch(err => console.error("Enrichment trigger failed:", err))
    } catch {
        // Ignore fetch errors, let background fail gracefully
    }

    return Response.json({ success: true, entryId: entry.id })
}
