import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const email = url.searchParams.get('email')

    if (!email) {
        return new Response('Email required', { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    return Response.json({ exists: !!user })
}
