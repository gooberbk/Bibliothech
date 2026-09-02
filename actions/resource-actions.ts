"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { UTApi } from "uploadthing/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"
import { downloadRateLimit, adminActionRateLimit } from "@/lib/rate-limit"
import { syncClerkUser } from "@/lib/clerk-sync"
import { trackUserActivity } from "@/lib/activity/tracker"
import { checkAndAwardBadges } from "@/lib/badges/awarding"
import { logResourceAction } from "@/lib/admin-audit"
import { logResourceAction } from "@/lib/admin-audit"
import {
  DeleteResourceSchema,
  ResourceIdSchema,
  ResourceSchema,
  type CreateResourceInput,
} from "@/lib/validations/resource"

const utapi = new UTApi()

const ensureAdmin = async () => {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }
  
  return admin
}

export const createResource = async (data: CreateResourceInput) => {
  const admin = await ensureAdmin()
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

  await logResourceAction(
    admin.id,
    admin.username,
    "CREATE_RESOURCE",
    resource.id,
    resource.title
  )

  await logResourceAction(
    admin.id,
    admin.username,
    "CREATE_RESOURCE",
    resource.id,
    resource.title
  )

  revalidatePath("/", "page")
  revalidateTag("resources-list", "max")
  return resource
}

export const getAdminResources = async (options?: {
  page?: number
  limit?: number
  search?: string
  category?: string
}) => {
  const admin = await ensureAdmin()
  
  const page = options?.page || 1
  const limit = options?.limit || 10
  const search = options?.search
  const category = options?.category

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && category !== "all" && { category }),
  }

  const [resources, total] = await Promise.all([
    db.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        author: true,
        category: true,
        type: true,
        pageCount: true,
        fileSizeMb: true,
        coverUrl: true,
        createdAt: true,
        downloadCount: true,
      },
    }),
    db.resource.count({ where }),
  ])

  return {
    resources,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export const deleteResource = async (id: string) => {
  const admin = await ensureAdmin()
  const { id: resourceId } = DeleteResourceSchema.parse({ id })

  const resource = await db.resource.findUnique({
    where: { id: resourceId },
    select: { id: true, fileKey: true, coverKey: true, title: true },
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

  await logResourceAction(
    admin.id,
    admin.username,
    "DELETE_RESOURCE",
    resource.id,
    resource.title
  )

  await logResourceAction(
    admin.id,
    admin.username,
    "DELETE_RESOURCE",
    resource.id,
    resource.title
  )

  revalidatePath("/", "page")
  revalidateTag("resources-list", "max")
}

export const updateResource = async (id: string, data: Partial<CreateResourceInput>) => {
  const admin = await ensureAdmin()
  const { id: resourceId } = ResourceIdSchema.parse({ id })
  
  const payload = ResourceSchema.partial().parse(data)

  // If category is being updated, find the category ID
  let categoryId = undefined
  if (payload.category) {
    const category = await db.category.findUnique({
      where: { name: payload.category },
    })
    if (!category) {
      throw new Error("Catégorie introuvable")
    }
    categoryId = category.id
  }

  const resource = await db.resource.update({
    where: { id: resourceId },
    data: {
      ...payload,
      ...(categoryId && { categoryId }),
    },
  })

  await logResourceAction(
    admin.id,
    admin.username,
    "UPDATE_RESOURCE",
    resource.id,
    resource.title
  )

  revalidatePath("/", "page")
  revalidateTag("resources-list", "max")
  return resource
}

export const getResourceById = async (id: string) => {
  const admin = await ensureAdmin()
  const { id: resourceId } = ResourceIdSchema.parse({ id })

  return db.resource.findUnique({
    where: { id: resourceId },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      category: true,
      type: true,
      pageCount: true,
      fileSizeMb: true,
      fileUrl: true,
      fileKey: true,
      coverUrl: true,
      coverKey: true,
      downloadCount: true,
      createdAt: true,
    },
  })
}

export const deleteMultipleResources = async (ids: string[]) => {
  const admin = await ensureAdmin()
  
  if (!ids || ids.length === 0) {
    throw new Error("Aucune ressource sélectionnée")
  }

  const resources = await db.resource.findMany({
    where: { id: { in: ids } },
    select: { id: true, fileKey: true, coverKey: true, title: true },
  })

  await db.resource.deleteMany({
    where: { id: { in: ids } },
  })

  // Delete files from storage
  const fileKeys = resources.flatMap(r => [r.fileKey, r.coverKey])
  try {
    await utapi.deleteFiles(fileKeys)
  } catch {
    // Continue even if storage cleanup fails
  }

  // Log each deletion
  for (const resource of resources) {
    await logResourceAction(
      admin.id,
      admin.username,
      "DELETE_RESOURCE",
      resource.id,
      resource.title
    )
  }

  revalidatePath("/", "page")
  revalidateTag("resources-list", "max")
  return { deletedCount: resources.length }
}

export const updateResource = async (id: string, data: Partial<CreateResourceInput>) => {
  const admin = await ensureAdmin()
  const { id: resourceId } = ResourceIdSchema.parse({ id })
  
  const payload = ResourceSchema.partial().parse(data)

  // If category is being updated, find the category ID
  let categoryId = undefined
  if (payload.category) {
    const category = await db.category.findUnique({
      where: { name: payload.category },
    })
    if (!category) {
      throw new Error("Catégorie introuvable")
    }
    categoryId = category.id
  }

  const resource = await db.resource.update({
    where: { id: resourceId },
    data: {
      ...payload,
      ...(categoryId && { categoryId }),
    },
  })

  await logResourceAction(
    admin.id,
    admin.username,
    "UPDATE_RESOURCE",
    resource.id,
    resource.title
  )

  revalidatePath("/", "page")
  revalidateTag("resources-list", "max")
  return resource
}

export const getResourceById = async (id: string) => {
  const admin = await ensureAdmin()
  const { id: resourceId } = ResourceIdSchema.parse({ id })

  return db.resource.findUnique({
    where: { id: resourceId },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      category: true,
      type: true,
      pageCount: true,
      fileSizeMb: true,
      fileUrl: true,
      fileKey: true,
      coverUrl: true,
      coverKey: true,
      downloadCount: true,
      createdAt: true,
    },
  })
}

export const deleteMultipleResources = async (ids: string[]) => {
  const admin = await ensureAdmin()
  
  if (!ids || ids.length === 0) {
    throw new Error("Aucune ressource sélectionnée")
  }

  const resources = await db.resource.findMany({
    where: { id: { in: ids } },
    select: { id: true, fileKey: true, coverKey: true, title: true },
  })

  await db.resource.deleteMany({
    where: { id: { in: ids } },
  })

  // Delete files from storage
  const fileKeys = resources.flatMap(r => [r.fileKey, r.coverKey])
  try {
    await utapi.deleteFiles(fileKeys)
  } catch {
    // Continue even if storage cleanup fails
  }

  // Log each deletion
  for (const resource of resources) {
    await logResourceAction(
      admin.id,
      admin.username,
      "DELETE_RESOURCE",
      resource.id,
      resource.title
    )
  }

  revalidatePath("/", "page")
  revalidateTag("resources-list", "max")
  return { deletedCount: resources.length }
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
