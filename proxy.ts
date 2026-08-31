import { auth } from '@/lib/auth/server';

export default auth.middleware((auth) => {
  // Allow public access to auth routes
  if (auth.request.nextUrl.pathname.startsWith('/sign-in') || 
      auth.request.nextUrl.pathname.startsWith('/sign-up') ||
      auth.request.nextUrl.pathname.startsWith('/api/auth') ||
      auth.request.nextUrl.pathname === '/') {
    return
  }
  return auth.protect({
    redirectTo: '/sign-in'
  })
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};