import { clerkMiddleware } from '@clerk/nextjs/server'
import { adminMiddleware } from '@/lib/admin-middleware'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip admin routes, Next.js internals, and static files.
    '/((?!admin|admin-login|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

// Apply admin middleware to admin routes
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin-login') {
    return adminMiddleware(request)
  }
  
  return clerkMiddleware()(request)
}
