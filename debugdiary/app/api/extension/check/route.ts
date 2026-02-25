import { prisma } from '@/lib/prisma'
import { authenticateExtension } from '../auth'
import { generateEmbedding } from '@/lib/gemini'

export async function POST(req: Request) {
    const user = await authenticateExtension(req)
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { errorText } = await req.json()
    if (!errorText) return new Response('Bad Request', { status: 400 })

    try {
        // Generate embedding for the new error
        const queryEmbedding = await generateEmbedding(errorText)

        // Fetch all user entries
        const entries = await prisma.entry.findMany({
            where: { userId: user.id }
        })

        let bestMatch = null
        let highestSimilarity = 0

        // Cosine similarity calc
        for (const entry of entries) {
            const dbEmbedding = entry.embedding as number[]
            if (!dbEmbedding || !Array.isArray(dbEmbedding) || dbEmbedding.length === 0) continue

            // Dot product
            let dotProduct = 0
            let normA = 0
            let normB = 0

            for (let i = 0; i < queryEmbedding.length; i++) {
                dotProduct += queryEmbedding[i] * dbEmbedding[i]
                normA += queryEmbedding[i] * queryEmbedding[i]
                normB += dbEmbedding[i] * dbEmbedding[i]
            }

            const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))

            if (similarity > highestSimilarity) {
                highestSimilarity = similarity
                bestMatch = entry
            }
        }

        // Return match if > 0.82 threshold
        if (highestSimilarity > 0.82 && bestMatch) {
            return Response.json({
                match: bestMatch,
                similarity: highestSimilarity
            })
        }

        return Response.json({ match: null })

    } catch (e) {
        console.error("Deja Vu check failed:", e)
        return Response.json({ match: null })
    }
}
