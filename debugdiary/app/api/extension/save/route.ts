import { prisma } from '@/lib/prisma'
import { authenticateExtension } from '../auth'
import { enrichWithRetry, embedWithRetry } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    console.log('Gemini key exists:', !!process.env.GEMINI_API_KEY)
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
            embedding: [], // Start empty, background job will populate
            aiEnriched: false
        }
    })

        // Fire and forget (don't await)
        ; (async () => {
            try {
                const enriched = await enrichWithRetry(
                    errorText,
                    fixText,
                    codeSnippet ?? undefined
                )

                const embedding = await embedWithRetry(
                    errorText + ' ' + fixText
                )

                await prisma.entry.update({
                    where: { id: entry.id },
                    data: {
                        ...enriched,
                        embedding,
                        aiEnriched: true
                    }
                })

                console.log('Extension entry enriched:', entry.id)
            } catch (err) {
                console.error('Extension enrichment failed:', err)
            }
        })()

    return NextResponse.json({
        success: true,
        entryId: entry.id
    })
}
