"use server"

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { createAdminSession, clearAdminSession } from "@/lib/admin-session"
import { verifyAdminPassword } from "@/lib/admin-password"

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  if (!username || !password) {
    redirect("/admin-login?error=missing")
  }

  const admin = await db.adminAccount.findUnique({
    where: { username },
  })

  if (!admin?.active || !verifyAdminPassword(password, admin.passwordHash)) {
    redirect("/admin-login?error=invalid")
  }

  await db.adminAccount.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })

  await createAdminSession(admin)
  redirect("/admin")
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect("/admin-login")
}
