import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!email || !password) {
            return new Response('Email and password required', { status: 400 })
        }

        const existing = await prisma.user.findUnique({
            where: { email }
        })

        if (existing) {
            return new Response('Email already registered', { status: 409 })
        }

        const user = await prisma.user.create({
            data: { name, email, password }
        })

        return Response.json({ success: true, userId: user.id })
    } catch (error) {
        console.error(error)
        return new Response('Internal Server Error', { status: 500 })
    }
}
