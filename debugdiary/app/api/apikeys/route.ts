import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { generateApiKey } from '@/lib/encryption'

export async function GET(req: Request) {
    const session = await getServerSession()
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response('Unauthorized', { status: 401 })

    const keys = await prisma.apiKey.findMany({
        where: { userId: user.id },
        include: { project: true },
        orderBy: { createdAt: 'desc' }
    })

    return Response.json(keys)
}

export async function POST(req: Request) {
    const session = await getServerSession()
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { label, projectId } = await req.json()

    const { plain, hashed } = generateApiKey()

    const apiKey = await prisma.apiKey.create({
        data: { 
            userId: user.id, 
            label: label || 'VS Code Extension',
            projectId: projectId || null,
            key: hashed
        }
    })

    return Response.json({ ...apiKey, key: plain })
}

export async function DELETE(req: Request) {
    const session = await getServerSession()
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { keyId } = await req.json()

    await prisma.apiKey.delete({
        where: { id: keyId, userId: user.id } // Ensure they own the key
    })

    return Response.json({ success: true })
}
