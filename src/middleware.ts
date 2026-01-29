import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    // Update session expiration
    await updateSession(request)

    const session = request.cookies.get('session')?.value
    const isLoginPage = request.nextUrl.pathname === '/login'

    // If trying to access protected route without session, redirect to login
    if (!session && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If trying to access login page with session, redirect to dashboard or kanban
    if (session && isLoginPage) {
        try {
            const secretKey = process.env.JWT_SECRET_KEY || 'secret-key-change-me'
            const key = new TextEncoder().encode(secretKey)
            const { payload } = await jwtVerify(session, key, {
                algorithms: ['HS256'],
            })

            const role = (payload.user as any)?.role as string

            // Redirect based on role
            if (role === 'CLIENT') {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            } else {
                return NextResponse.redirect(new URL('/kanban', request.url))
            }
        } catch (error) {
            console.error('Middleware decode error:', error)
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Role-based access control
    if (session) {
        try {
            const secretKey = process.env.JWT_SECRET_KEY || 'secret-key-change-me'
            const key = new TextEncoder().encode(secretKey)
            const { payload } = await jwtVerify(session, key, {
                algorithms: ['HS256'],
            })

            const role = (payload.user as any)?.role as string
            const pathname = request.nextUrl.pathname

            // Restricted routes for CLIENT role
            const restrictedRoutes = [
                '/kanban',
                '/members',
                '/onboarding',
                '/deliveries',
                '/meeting',
                '/archive',
                '/clients'
            ]

            if (role === 'CLIENT') {
                // Check if trying to access any restricted route
                const isRestricted = restrictedRoutes.some(route => pathname.startsWith(route))

                if (isRestricted) {
                    return NextResponse.redirect(new URL('/dashboard', request.url))
                }
            }
        } catch (error) {
            console.error('Middleware session decode error:', error)
        }
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
