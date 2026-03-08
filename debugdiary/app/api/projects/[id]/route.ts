import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return new Response('Unauthorized', { status: 401 })

        const { name, githubRepo } = await req.json()
        const { id } = await params

        // Basic validation for githubRepo if provided
        if (githubRepo && !githubRepo.startsWith('https://github.com/')) {
            return new Response('Repository URL must start with https://github.com/', { status: 400 })
        }

        const updated = await prisma.project.update({
            where: { id, userId: user.id },
            data: { 
                ...(name ? { name } : {}),
                ...(githubRepo !== undefined ? { githubRepo } : {})
            }
        })

        return NextResponse.json(updated)
    } catch (e) {
        return new Response('Error updating project', { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return new Response('Unauthorized', { status: 401 })

        const { id } = await params

        // Delete associated API keys first
        await prisma.apiKey.deleteMany({
            where: { projectId: id, userId: user.id }
        })

        await prisma.project.delete({
            where: { id, userId: user.id }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        return new Response('Error deleting project', { status: 500 })
    }
}
