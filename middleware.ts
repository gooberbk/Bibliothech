import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { adminMiddleware } from '@/lib/admin-middleware'

// Define which routes should be protected by Clerk
const isPublicRoute = createRouteMatcher(['/admin-login(.*)', '/(.*)'])

// Define which routes should be protected by admin middleware
const isAdminRoute = (pathname: string) => pathname.startsWith('/admin') && pathname !== '/admin-login'

export default clerkMiddleware((auth, request) => {
  if (isAdminRoute(request.nextUrl.pathname)) {
    return adminMiddleware(request)
  }
  
  if (!isPublicRoute(request.nextUrl.pathname)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
