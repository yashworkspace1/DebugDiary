import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return new Response('Unauthorized', { status: 401 })

        const projects = await prisma.project.findMany({
            where: { userId: user.id },
            include: {
                _count: { select: { entries: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        const mapped = projects.map(p => ({
            id: p.id,
            name: p.name,
            githubRepo: p.githubRepo,
            errorCount: p._count.entries,
            createdAt: p.createdAt
        }))

        return NextResponse.json(mapped)
    } catch (e) {
        return new Response('Error fetching projects', { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return new Response('Unauthorized', { status: 401 })

        const { name } = await req.json()
        if (!name) return new Response('Name is required', { status: 400 })

        const project = await prisma.project.create({
            data: { name, userId: user.id }
        })

        return NextResponse.json(project)
    } catch (e) {
        return new Response('Error creating project', { status: 500 })
    }
}
