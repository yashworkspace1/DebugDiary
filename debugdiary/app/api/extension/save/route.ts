import { prisma } from '@/lib/prisma'
import { authenticateExtension } from '../auth'
import { enrichEntry, generateEmbedding } from '@/lib/gemini'

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

    return Response.json({ success: true, entryId: entry.id })
}
