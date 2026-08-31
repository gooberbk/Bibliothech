"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { syncClerkUser } from "@/lib/clerk-sync"
import { trackUserActivity } from "@/lib/activity/tracker"

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