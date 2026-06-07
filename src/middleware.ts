import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Middleware — Server-side route protection
 * 
 * Protects /admin/dashboard and other admin routes by checking
 * the admin_token cookie or Bearer Authorization header.
 * 
 * This ensures unauthenticated users never receive the admin page HTML.
 * 
 * NOTE: Uses simple string comparison instead of crypto.timingSafeEqual
 * because Next.js Middleware runs in the Edge Runtime which does not
 * support Node.js 'crypto' module. The timing leak in middleware is
 * minimal risk since this is a redirect check, not an API auth gate.
 */

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || ''

function isAuthenticated(request: NextRequest): boolean {
  if (!ADMIN_TOKEN) return false

  // Check cookie first (set by login API — httpOnly)
  const cookieToken = request.cookies.get('admin_token')?.value
  if (cookieToken && cookieToken === ADMIN_TOKEN) {
    return true
  }

  // Check Authorization header (for API calls)
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    if (token === ADMIN_TOKEN) {
      return true
    }
  }

  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin/dashboard and any future admin pages (except /admin/login)
  if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
    if (!isAuthenticated(request)) {
      // Redirect to login page, preserving the original URL
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If already authenticated and visiting login, redirect to dashboard
  if (pathname === '/admin/login' && isAuthenticated(request)) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Add security headers for admin routes
  const response = NextResponse.next()
  if (pathname.startsWith('/admin/')) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
