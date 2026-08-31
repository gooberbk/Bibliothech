"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"
import { hashAdminPassword } from "@/lib/admin-password"

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Le nom utilisateur doit contenir au moins 3 caractères")
  .max(40)
  .regex(/^[a-z0-9._-]+$/i, "Utilisez lettres, chiffres, points, tirets ou underscores")
  .transform((value) => value.toLowerCase())

const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères")

export async function getAdminAccounts() {
  await ensureAdminSession()

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

export async function createAdminAccount(formData: FormData) {
  await ensureAdminSession()

  const username = usernameSchema.parse(formData.get("username"))
  const password = passwordSchema.parse(formData.get("password"))
  const name = String(formData.get("name") || "").trim() || null

  await db.adminAccount.create({
    data: {
      username,
      passwordHash: hashAdminPassword(password),
      name,
    },
  })

  revalidatePath("/admin/admins")
}

export async function updateAdminPassword(formData: FormData) {
  await ensureAdminSession()

  const id = z.string().cuid().parse(formData.get("id"))
  const password = passwordSchema.parse(formData.get("password"))

  await db.adminAccount.update({
    where: { id },
    data: { passwordHash: hashAdminPassword(password) },
  })

  revalidatePath("/admin/admins")
}

export async function toggleAdminAccount(formData: FormData) {
  const currentAdmin = await ensureAdminSession()

  const id = z.string().cuid().parse(formData.get("id"))
  const active = String(formData.get("active")) === "true"

  if (!active) {
    const activeAdminCount = await db.adminAccount.count({ where: { active: true } })
    if (activeAdminCount <= 1) {
      throw new Error("Impossible de désactiver le dernier admin actif")
    }
    if (id === currentAdmin.id) {
      throw new Error("Impossible de désactiver votre propre compte")
    }
  }

  await db.adminAccount.update({
    where: { id },
    data: { active },
  })

  revalidatePath("/admin/admins")
}

export async function deleteAdminAccount(formData: FormData) {
  const currentAdmin = await ensureAdminSession()
  const id = z.string().cuid().parse(formData.get("id"))

  if (id === currentAdmin.id) {
    throw new Error("Impossible de supprimer votre propre compte")
  }

  const activeAdminCount = await db.adminAccount.count({ where: { active: true } })
  const target = await db.adminAccount.findUnique({
    where: { id },
    select: { active: true },
  })

  if (target?.active && activeAdminCount <= 1) {
    throw new Error("Impossible de supprimer le dernier admin actif")
  }

  await db.adminAccount.delete({ where: { id } })
  revalidatePath("/admin/admins")
}
