"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { syncClerkUser } from "@/lib/clerk-sync"
import { z } from "zod"

const CategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
})

const CategoryIdSchema = z.object({
  id: z.string().cuid(),
})

type CreateCategoryInput = z.infer<typeof CategorySchema>
type UpdateCategoryInput = z.infer<typeof CategorySchema> & { id: string }

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

export const createCategory = async (data: CreateCategoryInput) => {
  await ensureAdmin()
  const payload = CategorySchema.parse(data)

  // Generate slug from name
  const slug = payload.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const category = await db.category.create({
    data: {
      name: payload.name,
      slug,
    },
  })

  revalidatePath("/admin/categories")
  revalidateTag("categories")
  return category
}

export const getCategories = async () => {
  await ensureAdmin()
  return db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { resources: true },
      },
    },
  })
}

export const getCategory = async (id: string) => {
  await ensureAdmin()
  const { id: categoryId } = CategoryIdSchema.parse({ id })

  return db.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { resources: true },
      },
    },
  })
}

export const updateCategory = async (data: UpdateCategoryInput) => {
  await ensureAdmin()
  const { id, ...rest } = data
  const payload = CategorySchema.parse(rest)
  const { id: categoryId } = CategoryIdSchema.parse({ id })

  // Generate new slug from updated name
  const slug = payload.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const category = await db.category.update({
    where: { id: categoryId },
    data: {
      name: payload.name,
      slug,
    },
  })

  // Update all resources with this category to maintain the category name
  await db.resource.updateMany({
    where: { categoryId: categoryId },
    data: { category: payload.name },
  })

  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${categoryId}`)
  revalidateTag("categories")
  return category
}

export const deleteCategory = async (id: string) => {
  await ensureAdmin()
  const { id: categoryId } = CategoryIdSchema.parse({ id })

  const category = await db.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { resources: true },
      },
    },
  })

  if (!category) {
    throw new Error("Catégorie introuvable")
  }

  if (category._count.resources > 0) {
    throw new Error(
      `Impossible de supprimer cette catégorie car elle contient ${category._count.resources} ressource(s)`
    )
  }

  await db.category.delete({
    where: { id: categoryId },
  })

  revalidatePath("/admin/categories")
  revalidateTag("categories")
  return { success: true }
}
