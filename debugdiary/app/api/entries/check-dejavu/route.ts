import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateEmbedding, cosineSimilarity } from '@/lib/gemini'

export async function POST(req: Request) {
    let session = null
    try {
        session = await getServerSession(authOptions)
    } catch (e) {
        console.warn("Auth session error:", e)
    }

    try {
        if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return new Response('Unauthorized', { status: 401 })

        const { errorText } = await req.json()
        if (!errorText || errorText.length < 3) return Response.json({ match: null })

        const queryEmbedding = await generateEmbedding(errorText)

        const entries = await prisma.entry.findMany({
            where: { userId: user.id }
        })

        let bestMatch = null
        let highestScore = 0

        entries.forEach((e: any) => {
            if (e.embedding) {
                const score = cosineSimilarity(queryEmbedding, e.embedding as number[])
                if (score > highestScore) {
                    highestScore = score
                    bestMatch = e
                }
            }
        })

        if (bestMatch && highestScore > 0.75) {
            return Response.json({ match: bestMatch, similarity: highestScore })
        }

        return Response.json({ match: null })
    } catch (e: any) {
        console.error('DejaVu check failed:', e)
        return Response.json({ match: null, error: e?.message || String(e) }, { status: 500 })
    }
}
