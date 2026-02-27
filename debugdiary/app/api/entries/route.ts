import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { enrichEntry, generateEmbedding } from '@/lib/gemini'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { searchParams } = new URL(req.url)
    const lang = searchParams.get('lang')
    const tag = searchParams.get('tag')

    const entries = await prisma.entry.findMany({
        where: {
            userId: user.id,
            ...(lang && { language: lang }),
            ...(tag && { tags: { has: tag } })
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
            createdAt: true,
            updatedAt: true,
            occurrences: true,
            affectedUrls: true,
            firstSeenAt: true,
            lastSeenAt: true
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
    const { errorText, fixText, codeSnippet, context } = body

    const entry = await prisma.entry.create({
        data: {
            userId: user.id,
            errorText,
            fixText,
            codeSnippet,
            context,
            aiEnriched: false,
            source: 'web'
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
