import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateEmbedding, cosineSimilarity } from '@/lib/gemini'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { query } = await req.json()
    if (!query) return new Response('Bad Request', { status: 400 })

    const queryEmbedding = await generateEmbedding(query)

    const entries = await prisma.entry.findMany({
        where: { userId: user.id }
    })

    const results = entries
        .filter((e: any) => e.embedding)
        .map((e: any) => ({
            ...e,
            score: cosineSimilarity(
                queryEmbedding,
                e.embedding as number[]
            )
        }))
        .filter((e: any) => e.score > 0.75)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 10)

    return Response.json(results)
}
