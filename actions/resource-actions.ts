"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { UTApi } from "uploadthing/server"
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
  // For now, skip admin check since auth is not implemented
  return "admin"
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
  throw new Error("Authentification non implémentée")
}

export const incrementDownload = async (resourceId: string) => {
  const { resourceId: parsedResourceId } = ResourceIdSchema.parse({ resourceId })

  const identifier = `guest:${parsedResourceId}`
  const { success } = await downloadRateLimit.limit(identifier)

  if (!success) {
    throw new Error("Limite de téléchargements atteinte (5/minute)")
  }

  await db.$transaction([
    db.download.create({
      data: {
        resourceId: parsedResourceId,
      },
    }),
    db.resource.update({
      where: { id: parsedResourceId },
      data: { downloadCount: { increment: 1 } },
    }),
  ])
}
