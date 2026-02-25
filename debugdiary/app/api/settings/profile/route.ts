import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

    try {
        const { name } = await req.json()
        if (!name) return new Response('Bad Request', { status: 400 })

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { name }
        })

        return Response.json(updatedUser)
    } catch (e) {
        return new Response('Internal Server Error', { status: 500 })
    }
}
