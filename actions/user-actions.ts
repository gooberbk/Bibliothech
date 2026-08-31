"use server"

import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateUserRole(formData: FormData) {
  const session = await auth.getSession()
  if (!session?.user) {
    throw new Error("Connexion requise")
  }

  const currentUser = await db.user.findUnique({
    where: { neonId: session.user.id },
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

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${targetUserId}/edit`)
}