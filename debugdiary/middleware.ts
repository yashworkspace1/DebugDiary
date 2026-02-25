import { withAuth } from 'next-auth/middleware'

export default withAuth({
    pages: { signIn: '/login' }
})

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/entries/:path*',
        '/search/:path*',
        '/settings/:path*',
        '/dejavu/:path*'
    ]
}
