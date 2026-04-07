"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { UTApi } from "uploadthing/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { downloadRateLimit } from "@/lib/rate-limit"
import {
  DeleteResourceSchema,
  ResourceIdSchema,
  ResourceSchema,
  type CreateResourceInput,
} from "@/lib/validations/resource"

const utapi = new UTApi()

const ensureAdmin = async () => {
  const session = await auth()
  if (session?.user.role !== "ADMIN") {
    throw new Error("Accès refusé")
  }
  return session.user
}

export const createResource = async (data: CreateResourceInput) => {
  await ensureAdmin()
  const payload = ResourceSchema.parse(data)

  const resource = await db.resource.create({
    data: payload,
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
  const session = await auth()
  if (!session?.user.id) {
    throw new Error("Connexion requise")
  }

  const { resourceId: parsedResourceId } = ResourceIdSchema.parse({ resourceId })

  const existing = await db.favorite.findUnique({
    where: {
      userId_resourceId: {
        userId: session.user.id,
        resourceId: parsedResourceId,
      },
    },
    select: { id: true },
  })

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } })
    return { isFavorite: false }
  }

  await db.favorite.create({
    data: {
      userId: session.user.id,
      resourceId: parsedResourceId,
    },
  })

  return { isFavorite: true }
}

export const incrementDownload = async (resourceId: string) => {
  const session = await auth()
  const { resourceId: parsedResourceId } = ResourceIdSchema.parse({ resourceId })

  const identifier = session?.user.id ?? `guest:${parsedResourceId}`
  const { success } = await downloadRateLimit.limit(identifier)

  if (!success) {
    throw new Error("Limite de téléchargements atteinte (5/minute)")
  }

  await db.$transaction([
    db.download.create({
      data: {
        userId: session?.user.id,
        resourceId: parsedResourceId,
      },
    }),
    db.resource.update({
      where: { id: parsedResourceId },
      data: { downloadCount: { increment: 1 } },
    }),
  ])
}
