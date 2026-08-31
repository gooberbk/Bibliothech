"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { UTApi } from "uploadthing/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"
import { downloadRateLimit } from "@/lib/rate-limit"
import { syncClerkUser } from "@/lib/clerk-sync"
import { trackUserActivity } from "@/lib/activity/tracker"
import { checkAndAwardBadges } from "@/lib/badges/awarding"
import {
  DeleteResourceSchema,
  ResourceIdSchema,
  ResourceSchema,
  type CreateResourceInput,
} from "@/lib/validations/resource"

const utapi = new UTApi()

const ensureAdmin = async () => {
  return ensureAdminSession()
}

export const createResource = async (data: CreateResourceInput) => {
  await ensureAdmin()
  const payload = ResourceSchema.parse(data)

  // Find category by name to get categoryId
  const category = await db.category.findUnique({
    where: { name: payload.category },
  })

  if (!category) {
    throw new Error("Catégorie introuvable")
  }

  const resource = await db.resource.create({
    data: {
      ...payload,
      categoryId: category.id,
    },
  })

  revalidatePath("/", "page")
  revalidateTag("resources-list", "max")
  return resource
}

export const getAdminResources = async () => {
  await ensureAdmin()
  return db.resource.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export const deleteResource = async (id: string) => {
  await ensureAdmin()
  const { id: resourceId } = DeleteResourceSchema.parse({ id })

  const resource = await db.resource.findUnique({
    where: { id: resourceId },
    select: { id: true, fileKey: true, coverKey: true },
  })

  if (!resource) {
    throw new Error("Ressource introuvable")
  }

  await db.resource.delete({ where: { id: resource.id } })
  try {
    await utapi.deleteFiles([resource.fileKey, resource.coverKey])
  } catch {
    // Keeps DB deletion successful even if storage cleanup fails for legacy/temp keys.
  }

  revalidatePath("/", "page")
  revalidateTag("resources-list", "max")
}

export const toggleFavorite = async (resourceId: string) => {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Connexion requise")
  }

  const { resourceId: parsedResourceId } = ResourceIdSchema.parse({ resourceId })

  // Sync Clerk user with database
  await syncClerkUser(userId, {})

  // Find user by clerkId
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  const existing = await db.favorite.findUnique({
    where: {
      userId_resourceId: {
        userId: user.id,
        resourceId: parsedResourceId,
      },
    },
    select: { id: true },
  })

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } })

    // Track activity
    await trackUserActivity({
      userId: user.id,
      action: 'unfavorite',
      entityId: parsedResourceId,
      entityType: 'resource',
    })

    return { isFavorite: false }
  }

  await db.favorite.create({
    data: {
      userId: user.id,
      resourceId: parsedResourceId,
    },
  })

  // Track activity
  await trackUserActivity({
    userId: user.id,
    action: 'favorite',
    entityId: parsedResourceId,
    entityType: 'resource',
  })

  // Check for badge awards
  await checkAndAwardBadges(user.id)

  return { isFavorite: true }
}

export const incrementDownload = async (resourceId: string) => {
  const { userId } = await auth()
  const { resourceId: parsedResourceId } = ResourceIdSchema.parse({ resourceId })

  const identifier = userId ?? `guest:${parsedResourceId}`
  const { success } = await downloadRateLimit.limit(identifier)

  if (!success) {
    throw new Error("Limite de téléchargements atteinte (5/minute)")
  }

  let dbUserId: string | null = null
  if (userId) {
    // Sync Clerk user with database
    await syncClerkUser(userId, {})
    
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })
    dbUserId = user?.id ?? null
  }

  await db.$transaction([
    db.download.create({
      data: {
        userId: dbUserId,
        resourceId: parsedResourceId,
      },
    }),
    db.resource.update({
      where: { id: parsedResourceId },
      data: { downloadCount: { increment: 1 } },
    }),
  ])

  // Track activity if user is logged in
  if (dbUserId) {
    await trackUserActivity({
      userId: dbUserId,
      action: 'download',
      entityId: parsedResourceId,
      entityType: 'resource',
    })

    // Check for badge awards
    await checkAndAwardBadges(dbUserId)
  }
}
