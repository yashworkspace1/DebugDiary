import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const { id } = await params
    const entry = await prisma.entry.findUnique({
        where: { id }
    })

    return Response.json(entry)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const { id } = await params
    const body = await req.json()
    const updated = await prisma.entry.update({
        where: { id },
        data: body
    })

    return Response.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const { id } = await params
    await prisma.entry.delete({
        where: { id }
    })

    return Response.json({ success: true })
}
