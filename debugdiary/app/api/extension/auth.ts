import { prisma } from '@/lib/prisma'

export async function authenticateExtension(req: Request) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.substring(7)

    // Find the key and update lastUsed
    const apiKey = await prisma.apiKey.findUnique({
        where: { key: token },
        include: { user: true }
    })

    if (!apiKey) return null

    await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date() }
    })

    return apiKey.user
}
