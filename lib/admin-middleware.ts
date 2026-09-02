import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { getAdminSession } from '@/lib/admin-session'

// Simple in-memory rate limiting for admin access attempts
const adminAccessAttempts = new Map<string, { count: number; lastAttempt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 10

export async function adminMiddleware(req: NextRequest) {
  // Skip middleware for login page
  if (req.nextUrl.pathname === '/admin-login') {
    return NextResponse.next()
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

  // Rate limiting on admin access attempts
  const now = Date.now()
  const attempts = adminAccessAttempts.get(ip) || { count: 0, lastAttempt: 0 }

  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    // Reset the counter if window has passed
    adminAccessAttempts.set(ip, { count: 0, lastAttempt: now })
  } else {
    attempts.count++
    attempts.lastAttempt = now
    adminAccessAttempts.set(ip, attempts)

    if (attempts.count > MAX_ATTEMPTS) {
      const loginUrl = new URL('/admin-login', req.url)
      loginUrl.searchParams.set('error', 'too_many_attempts')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check admin session for all other admin routes
  const admin = await getAdminSession()
  
  if (!admin) {
    // Redirect to login if no valid session
    const loginUrl = new URL('/admin-login', req.url)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if admin account is still active
  if (!admin.active) {
    const loginUrl = new URL('/admin-login', req.url)
    loginUrl.searchParams.set('error', 'account_disabled')
    return NextResponse.redirect(loginUrl)
  }

  // Reset attempts on successful access
  adminAccessAttempts.delete(ip)

  return NextResponse.next()
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { getAdminSession } from '@/lib/admin-session'

// Simple in-memory rate limiting for admin access attempts
const adminAccessAttempts = new Map<string, { count: number; lastAttempt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 10

export async function adminMiddleware(req: NextRequest) {
  // Skip middleware for login page
  if (req.nextUrl.pathname === '/admin-login') {
    return NextResponse.next()
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

  // Rate limiting on admin access attempts
  const now = Date.now()
  const attempts = adminAccessAttempts.get(ip) || { count: 0, lastAttempt: 0 }

  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    // Reset the counter if window has passed
    adminAccessAttempts.set(ip, { count: 0, lastAttempt: now })
  } else {
    attempts.count++
    attempts.lastAttempt = now
    adminAccessAttempts.set(ip, attempts)

    if (attempts.count > MAX_ATTEMPTS) {
      const loginUrl = new URL('/admin-login', req.url)
      loginUrl.searchParams.set('error', 'too_many_attempts')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check admin session for all other admin routes
  const admin = await getAdminSession()
  
  if (!admin) {
    // Redirect to login if no valid session
    const loginUrl = new URL('/admin-login', req.url)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if admin account is still active
  if (!admin.active) {
    const loginUrl = new URL('/admin-login', req.url)
    loginUrl.searchParams.set('error', 'account_disabled')
    return NextResponse.redirect(loginUrl)
  }

  // Reset attempts on successful access
  adminAccessAttempts.delete(ip)

  return NextResponse.next()
}