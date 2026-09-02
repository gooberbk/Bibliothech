"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { createAdminSession, clearAdminSession } from "@/lib/admin-session"
import { verifyAdminPassword } from "@/lib/admin-password"
import { adminLoginRateLimit } from "@/lib/rate-limit"
import { logAdminLogin, logAdminLogout } from "@/lib/admin-audit"

async function logAdminLoginHistory(
  adminId: string,
  username: string,
  success: boolean,
  failureReason?: string
) {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
  const userAgent = headersList.get("user-agent") || "unknown"

  await db.adminLoginHistory.create({
    data: {
      adminId,
      adminUsername: username,
      ipAddress: ip,
      userAgent,
      success,
      failureReason,
    },
  })
}

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  if (!username || !password) {
    redirect("/admin-login?error=missing")
  }

  // Rate limiting based on IP
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
  
  const { success } = await adminLoginRateLimit.limit(ip)
  if (!success) {
    // Log rate limit attempt
    const admin = await db.adminAccount.findUnique({ where: { username } })
    if (admin) {
      await logAdminLogin(admin.id, admin.username, false)
    }
    redirect("/admin-login?error=ratelimit")
  }

  const admin = await db.adminAccount.findUnique({
    where: { username },
  })

  if (!admin?.active || !verifyAdminPassword(password, admin.passwordHash)) {
    // Log failed login attempt
    if (admin) {
      await logAdminLogin(admin.id, admin.username, false)
      await logAdminLoginHistory(admin.id, admin.username, false, "Invalid credentials or inactive account")
    }
    redirect("/admin-login?error=invalid")
  }

  await db.adminAccount.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })

  await logAdminLogin(admin.id, admin.username, true)
  await logAdminLoginHistory(admin.id, admin.username, true)
  await createAdminSession(admin)
  redirect("/admin")
}

export async function logoutAdmin() {
  const admin = await db.adminAccount.findFirst({
    where: { active: true },
    select: { id: true, username: true },
  })
  
  if (admin) {
    await logAdminLogout(admin.id, admin.username)
  }
  
  await clearAdminSession()
  redirect("/admin-login")
}
