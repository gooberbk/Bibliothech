"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"
import { hashAdminPassword } from "@/lib/admin-password"
import { adminActionRateLimit } from "@/lib/rate-limit"
import { 
  logAdminAccountAction, 
  invalidateAdminSessions 
} from "@/lib/admin-audit"

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Le nom utilisateur doit contenir au moins 3 caractères")
  .max(40, "Le nom utilisateur ne peut pas dépasser 40 caractères")
  .regex(/^[a-z0-9._-]+$/i, "Utilisez lettres, chiffres, points, tirets ou underscores")
  .transform((value) => value.toLowerCase())

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial")

export async function getAdminAccounts() {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  return db.adminAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      name: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })
}

export async function getAdminLoginHistory(adminId: string, limit: number = 20) {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const targetAdmin = await db.adminAccount.findUnique({
    where: { id: adminId },
    select: { username: true },
  })

  if (!targetAdmin) {
    throw new Error("Compte admin introuvable")
  }

  return db.adminLoginHistory.findMany({
    where: { adminId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      success: true,
      failureReason: true,
      createdAt: true,
    },
  })
}

export async function createAdminAccount(formData: FormData) {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const username = usernameSchema.parse(formData.get("username"))
  const password = passwordSchema.parse(formData.get("password"))
  const name = String(formData.get("name") || "").trim() || null

  // Check for username uniqueness
  const existingAdmin = await db.adminAccount.findUnique({
    where: { username },
  })

  if (existingAdmin) {
    throw new Error("Ce nom utilisateur est déjà utilisé")
  }

  const newAdmin = await db.adminAccount.create({
    data: {
      username,
      passwordHash: hashAdminPassword(password),
      name,
    },
  })

  await logAdminAccountAction(
    admin.id,
    admin.username,
    "CREATE_ADMIN",
    newAdmin.id,
    newAdmin.username
  )

  revalidatePath("/admin/admins")
}

export async function updateAdminPassword(formData: FormData) {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const id = z.string().cuid().parse(formData.get("id"))
  const password = passwordSchema.parse(formData.get("password"))

  const targetAdmin = await db.adminAccount.findUnique({
    where: { id },
    select: { username: true },
  })

  if (!targetAdmin) {
    throw new Error("Compte admin introuvable")
  }

  // Prevent self-password change (optional, depending on requirements)
  if (id === admin.id) {
    throw new Error("Impossible de modifier votre propre mot de passe depuis cette interface")
  }

  await db.adminAccount.update({
    where: { id },
    data: { passwordHash: hashAdminPassword(password) },
  })

  // Invalidate all sessions for the target admin
  await invalidateAdminSessions(id)

  await logAdminAccountAction(
    admin.id,
    admin.username,
    "UPDATE_ADMIN_PASSWORD",
    id,
    targetAdmin.username
  )

  revalidatePath("/admin/admins")
}

export async function toggleAdminAccount(formData: FormData) {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const id = z.string().cuid().parse(formData.get("id"))
  const active = String(formData.get("active")) === "true"

  if (!active) {
    const activeAdminCount = await db.adminAccount.count({ where: { active: true } })
    if (activeAdminCount <= 1) {
      throw new Error("Impossible de désactiver le dernier admin actif")
    }
    if (id === admin.id) {
      throw new Error("Impossible de désactiver votre propre compte")
    }
  }

  const targetAdmin = await db.adminAccount.findUnique({
    where: { id },
    select: { username: true },
  })

  if (!targetAdmin) {
    throw new Error("Compte admin introuvable")
  }

  await db.adminAccount.update({
    where: { id },
    data: { active },
  })

  // Invalidate sessions if deactivating
  if (!active) {
    await invalidateAdminSessions(id)
  }

  await logAdminAccountAction(
    admin.id,
    admin.username,
    "TOGGLE_ADMIN_STATUS",
    id,
    targetAdmin.username,
    { newStatus: active ? "active" : "inactive" }
  )

  revalidatePath("/admin/admins")
}

export async function deleteAdminAccount(formData: FormData) {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const id = z.string().cuid().parse(formData.get("id"))

  if (id === admin.id) {
    throw new Error("Impossible de supprimer votre propre compte")
  }

  const activeAdminCount = await db.adminAccount.count({ where: { active: true } })
  const target = await db.adminAccount.findUnique({
    where: { id },
    select: { active: true, username: true },
  })

  if (!target) {
    throw new Error("Compte admin introuvable")
  }

  if (target.active && activeAdminCount <= 1) {
    throw new Error("Impossible de supprimer le dernier admin actif")
  }

  await db.adminAccount.delete({ where: { id } })
  
  await logAdminAccountAction(
    admin.id,
    admin.username,
    "DELETE_ADMIN",
    id,
    target.username
  )
  
  revalidatePath("/admin/admins")
}