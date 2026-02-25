import { authenticateExtension } from '../auth'

export async function GET(req: Request) {
    const user = await authenticateExtension(req)

    if (!user) {
        return Response.json({ valid: false }, { status: 401 })
    }

    return Response.json({
        valid: true,
        userName: user.name
    })
}
