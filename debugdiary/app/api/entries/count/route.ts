import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

    const count = await prisma.entry.count({
        where: { userId: session.user.id }
    })

    return Response.json({ count })
}
