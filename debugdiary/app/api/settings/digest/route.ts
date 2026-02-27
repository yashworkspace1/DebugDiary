import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { emailAlerts: true, timezone: true }
    })

    if (!user) return new Response('Not found', { status: 404 })

    return Response.json(user)
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new Response('Unauthorized', { status: 401 })

    const body = await req.json()
    const updateData: any = {}

    if (typeof body.emailAlerts === 'boolean') updateData.emailAlerts = body.emailAlerts
    if (typeof body.timezone === 'string') updateData.timezone = body.timezone

    const user = await prisma.user.update({
        where: { email: session.user.email },
        data: updateData,
        select: { emailAlerts: true, timezone: true }
    })

    return Response.json(user)
}
