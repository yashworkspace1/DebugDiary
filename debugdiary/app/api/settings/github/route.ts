import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { encrypt, maskPAT } from '@/lib/encryption'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) return new Response('Unauthorized', { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: (session?.user as any).id },
        select: { githubPAT: true }
    })

    if (!user) return new Response('Unauthorized', { status: 401 })

    return Response.json({
        githubPAT: user.githubPAT ? maskPAT(user.githubPAT) : ''
    })
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) return new Response('Unauthorized', { status: 401 })

    const { githubPAT } = await req.json()

    // Only encrypt if a new PAT is provided (not the masked version)
    const encryptedPAT =
        githubPAT && !githubPAT.startsWith('•')
            ? encrypt(githubPAT)
            : undefined

    await prisma.user.update({
        where: { id: (session?.user as any).id },
        data: {
            ...(encryptedPAT ? { githubPAT: encryptedPAT } : {})
        }
    })

    return Response.json({ success: true })
}

export async function DELETE() {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) return new Response('Unauthorized', { status: 401 })

    await prisma.user.update({
        where: { id: (session?.user as any).id },
        data: {
            githubPAT: null
        }
    })

    return Response.json({ success: true })
}
