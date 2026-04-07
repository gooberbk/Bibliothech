import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/auth"

const AUTH_PAGES = ["/login", "/register"]

type AppProxyRequest = NextRequest & {
  auth?: {
    user?: {
      role?: string
    }
  }
}

export default auth((req: AppProxyRequest) => {
  const pathname = req.nextUrl.pathname
  const isAuthenticated = Boolean(req.auth?.user)

  if (pathname.startsWith("/admin")) {
    const role = req.auth?.user?.role
    if (!isAuthenticated || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (AUTH_PAGES.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
}
