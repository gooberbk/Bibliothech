"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { syncClerkUser } from "@/lib/clerk-sync"
import { trackUserActivity } from "@/lib/activity/tracker"
import { awardNewMemberBadge, checkAndAwardBadges } from "@/lib/badges/awarding"

const ensureAdmin = async () => {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Connexion requise")
  }

  // Sync Clerk user with database
  await syncClerkUser(userId, {})

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  })

  if (!user || user.role !== "ADMIN") {
    throw new Error("Accès refusé")
  }

  return user.id
}

export async function getAdminUsers() {
  await ensureAdmin()
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
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
  })
}

export async function getUserDetails(userId: string) {
  await ensureAdmin()
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
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Connexion requise")
  }

  // Sync Clerk user with database
  await syncClerkUser(userId, {})

  const currentUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Accès refusé")
  }

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

  await db.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  })

  // Track activity
  await trackUserActivity({
    userId: currentUser.id,
    action: 'role_change',
    entityId: targetUserId,
    entityType: 'user',
    metadata: { newRole },
  })

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${targetUserId}/edit`)
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