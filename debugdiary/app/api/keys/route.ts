import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import crypto from 'crypto'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) return new Response('Unauthorized', { status: 401 })

    const keys = await prisma.apiKey.findMany({
        where: { userId: (session?.user as any).id },
        orderBy: { createdAt: 'desc' }
    })
    return Response.json(keys)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) return new Response('Unauthorized', { status: 401 })

    const { name } = await req.json()
    if (!name) return new Response('Bad Request', { status: 400 })

    const key = `dd_${crypto.randomBytes(24).toString('hex')}`

    const apiKey = await prisma.apiKey.create({
        data: {
            userId: (session?.user as any).id,
            label: name,
            key
        }
    })

    return Response.json(apiKey)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) return new Response('Unauthorized', { status: 401 })

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return new Response('Bad Request', { status: 400 })

    await prisma.apiKey.deleteMany({
        where: {
            id,
            userId: (session?.user as any).id
        }
    })

    return new Response('Deleted', { status: 200 })
}
