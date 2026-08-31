import { authMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up', '/book/:path*', '/api/webhooks/clerk'],
  ignoredRoutes: ['/api/webhooks/clerk'],
  afterAuth: async (auth, req) => {
    // Handle admin route protection
    if (req.nextUrl.pathname.startsWith('/admin') && !auth.userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // For now, allow all authenticated users to access admin routes
    // Role-based access control will be handled in the page components
    return NextResponse.next()
  },
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
