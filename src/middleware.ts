import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    // Update session expiration
    await updateSession(request)

    const session = request.cookies.get('session')?.value
    const isLoginPage = request.nextUrl.pathname === '/login'

    // If trying to access protected route without session, redirect to login
    if (!session && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If trying to access login page with session, redirect to home
    if (session && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
