import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

    try {
        await prisma.user.delete({
            where: { id: session.user.id }
        })

        return new Response('Account deleted', { status: 200 })
    } catch (e) {
        return new Response('Internal Server Error', { status: 500 })
    }
}
