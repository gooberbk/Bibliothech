"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { trackUserActivity } from "@/lib/activity/tracker"
import { awardNewMemberBadge, checkAndAwardBadges } from "@/lib/badges/awarding"
import { auth } from "@clerk/nextjs/server"
import { syncClerkUser } from "@/lib/clerk-sync"
import { ensureAdminSession } from "@/lib/admin-session"
import { adminActionRateLimit } from "@/lib/rate-limit"
import { logUserAction } from "@/lib/admin-audit"
import { adminActionRateLimit } from "@/lib/rate-limit"
import { logUserAction } from "@/lib/admin-audit"

const ensureAdmin = async () => {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }
  
  return admin
}

export async function getAdminUsers(options?: {
  page?: number
  limit?: number
  search?: string
  role?: "USER" | "ADMIN" | "ALL"
}) {
  const admin = await ensureAdmin()
  
  const page = options?.page || 1
  const limit = options?.limit || 10
  const search = options?.search
  const role = options?.role

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(role && role !== "ALL" && { role }),
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            downloads: true,
            favorites: true,
            activities: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ])

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getUserDetails(userId: string) {
  const admin = await ensureAdmin()
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      socialLinks: true,
      academicInfo: true,
      profileVisible: true,
      activityVisible: true,
      createdAt: true,
      _count: {
        select: {
          downloads: true,
          favorites: true,
          activities: true,
          badges: true,
        },
      },
    },
  })
}

export async function updateUserRole(formData: FormData) {
  const admin = await ensureAdmin()

  const targetUserId = formData.get("userId") as string
  const newRole = formData.get("newRole") as "USER" | "ADMIN"

  if (!targetUserId || !newRole) {
    throw new Error("Données invalides")
  }

  // Prevent removing admin role from the last admin
  if (newRole === "USER") {
    const adminCount = await db.user.count({
      where: { role: "ADMIN" },
    })

    if (adminCount <= 1) {
      throw new Error("Impossible de rétrograder le dernier administrateur")
    }
  }

  // Prevent self-demotion
  if (targetUserId === admin.id) {
    throw new Error("Impossible de modifier votre propre rôle")
  }

  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
    select: { email: true, role: true },
  })

  if (!targetUser) {
    throw new Error("Utilisateur introuvable")
  }

  // Check if role is actually changing
  if (targetUser.role === newRole) {
    throw new Error("L'utilisateur a déjà ce rôle")
  }

  // Prevent self-demotion
  if (targetUserId === admin.id) {
    throw new Error("Impossible de modifier votre propre rôle")
  }

  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
    select: { email: true, role: true },
  })

  if (!targetUser) {
    throw new Error("Utilisateur introuvable")
  }

  // Check if role is actually changing
  if (targetUser.role === newRole) {
    throw new Error("L'utilisateur a déjà ce rôle")
  }

  await db.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  })

  await logUserAction(
    admin.id,
    admin.username,
    "UPDATE_USER_ROLE",
    targetUserId,
    targetUser.email || "unknown",
    newRole
  )

  await logUserAction(
    admin.id,
    admin.username,
    "UPDATE_USER_ROLE",
    targetUserId,
    targetUser.email || "unknown",
    newRole
  )

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${targetUserId}/edit`)
}

export async function updateUserPermissions(userId: string, permissions: {
  canEditResources: boolean
  canDeleteResources: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
}) {
  const admin = await ensureAdmin()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    throw new Error("Utilisateur introuvable")
  }

  // Only admins can have custom permissions
  if (user.role !== "ADMIN") {
    throw new Error("Seuls les administrateurs peuvent avoir des permissions personnalisées")
  }

  // Update user with permissions (assuming a permissions field in schema)
  // For now, we'll just log the action
  await logUserAction(
    admin.id,
    admin.username,
    "UPDATE_USER_PERMISSIONS",
    userId,
    user.email || "unknown",
    JSON.stringify(permissions)
  )

  return { success: true }
}

export async function updateUserPermissions(userId: string, permissions: {
  canEditResources: boolean
  canDeleteResources: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
}) {
  const admin = await ensureAdmin()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    throw new Error("Utilisateur introuvable")
  }

  // Only admins can have custom permissions
  if (user.role !== "ADMIN") {
    throw new Error("Seuls les administrateurs peuvent avoir des permissions personnalisées")
  }

  // Update user with permissions (assuming a permissions field in schema)
  // For now, we'll just log the action
  await logUserAction(
    admin.id,
    admin.username,
    "UPDATE_USER_PERMISSIONS",
    userId,
    user.email || "unknown",
    JSON.stringify(permissions)
  )

  return { success: true }
}

export async function trackUserLogin() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Connexion requise")
  }

  // Sync Clerk user with database
  await syncClerkUser(userId, {})

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  // Track login activity
  await trackUserActivity({
    userId: user.id,
    action: 'login',
  })

  // Award new member badge on first login
  await awardNewMemberBadge(user.id)

  // Check for other badge awards
  await checkAndAwardBadges(user.id)

  return { success: true }
}
