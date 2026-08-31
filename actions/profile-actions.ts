"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { syncClerkUser } from "@/lib/clerk-sync"
import { z } from "zod"

const ProfileUpdateSchema = z.object({
  bio: z.string().max(500, "La bio ne doit pas dépasser 500 caractères").optional(),
  socialLinks: z.string().optional(),
  academicInfo: z.string().optional(),
})

const PrivacySettingsSchema = z.object({
  profileVisible: z.boolean(),
  activityVisible: z.boolean(),
})

const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  updateNotifications: z.boolean(),
})

type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>
type PrivacySettingsInput = z.infer<typeof PrivacySettingsSchema>
type NotificationSettingsInput = z.infer<typeof NotificationSettingsSchema>

const ensureUser = async () => {
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

  return user.id
}

export const updateProfile = async (data: ProfileUpdateInput) => {
  const userId = await ensureUser()
  const payload = ProfileUpdateSchema.parse(data)

  await db.user.update({
    where: { id: userId },
    data: {
      bio: payload.bio,
      socialLinks: payload.socialLinks,
      academicInfo: payload.academicInfo,
    },
  })

  revalidatePath("/profile")
  revalidatePath("/profile/edit")
  return { success: true }
}

export const updatePrivacySettings = async (data: PrivacySettingsInput) => {
  const userId = await ensureUser()
  const payload = PrivacySettingsSchema.parse(data)

  await db.user.update({
    where: { id: userId },
    data: {
      profileVisible: payload.profileVisible,
      activityVisible: payload.activityVisible,
    },
  })

  revalidatePath("/profile")
  revalidatePath("/settings")
  return { success: true }
}

export const updateNotificationSettings = async (data: NotificationSettingsInput) => {
  const userId = await ensureUser()
  const payload = NotificationSettingsSchema.parse(data)

  // Note: For now, we'll store these in a JSON metadata field
  // In a real implementation, you might want a separate table for notification preferences
  await db.user.update({
    where: { id: userId },
    data: {
      // For now, we don't have a field for notification settings in the schema
      // This is a placeholder for future implementation
    },
  })

  revalidatePath("/settings")
  return { success: true }
}

export const deleteAccount = async () => {
  const userId = await ensureUser()

  // Delete user's data
  await db.user.delete({
    where: { id: userId },
  })

  // Note: In a real implementation, you would also:
  // 1. Delete the user from Clerk
  // 2. Clean up any external services
  // 3. Handle data retention policies

  return { success: true }
}
