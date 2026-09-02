"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"
import { adminActionRateLimit } from "@/lib/rate-limit"
import { logCategoryAction } from "@/lib/admin-audit"
import { z } from "zod"

const CategorySchema = z.object({
  name: z.string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-Z0-9\sÀ-ÿ-]+$/, "Le nom ne peut contenir que des lettres, chiffres, espaces et tirets")
    .transform(val => val.trim())
    .refine(val => val.length > 0, "Le nom ne peut pas être vide"),
})

const CategoryIdSchema = z.object({
  id: z.string().cuid(),
})

type CreateCategoryInput = z.infer<typeof CategorySchema>
type UpdateCategoryInput = z.infer<typeof CategorySchema> & { id: string }

const ensureAdmin = async () => {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }
  
  return admin
}

export const createCategory = async (data: CreateCategoryInput) => {
  const admin = await ensureAdmin()
  const payload = CategorySchema.parse(data)

  // Generate slug from name
  const slug = payload.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Check for slug uniqueness
  const existingCategory = await db.category.findUnique({
    where: { slug },
  })

  if (existingCategory) {
    throw new Error("Une catégorie avec ce nom existe déjà")
  }

  // Check for name uniqueness (case-insensitive)
  const existingName = await db.category.findFirst({
    where: {
      name: {
        equals: payload.name,
        mode: 'insensitive',
      },
    },
  })

  if (existingName) {
    throw new Error("Une catégorie avec ce nom existe déjà")
  }

  const category = await db.category.create({
    data: {
      name: payload.name,
      slug,
    },
  })

  await logCategoryAction(
    admin.id,
    admin.username,
    "CREATE_CATEGORY",
    category.id,
    category.name
  )

  revalidatePath("/admin/categories")
  return category
}

export const getCategories = async () => {
  const admin = await ensureAdmin()
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
  const admin = await ensureAdmin()
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
  const admin = await ensureAdmin()
  const { id, ...rest } = data
  const payload = CategorySchema.parse(rest)
  const { id: categoryId } = CategoryIdSchema.parse({ id })

  // Get current category
  const currentCategory = await db.category.findUnique({
    where: { id: categoryId },
  })

  if (!currentCategory) {
    throw new Error("Catégorie introuvable")
  }

  // Generate new slug from updated name
  const slug = payload.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Check for slug uniqueness if slug changed
  if (slug !== currentCategory.slug) {
    const existingSlug = await db.category.findUnique({
      where: { slug },
    })

    if (existingSlug) {
      throw new Error("Une catégorie avec ce nom existe déjà")
    }
  }

  // Check for name uniqueness if name changed (case-insensitive)
  if (payload.name.toLowerCase() !== currentCategory.name.toLowerCase()) {
    const existingName = await db.category.findFirst({
      where: {
        name: {
          equals: payload.name,
          mode: 'insensitive',
        },
        id: { not: categoryId },
      },
    })

    if (existingName) {
      throw new Error("Une catégorie avec ce nom existe déjà")
    }
  }

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

  await logCategoryAction(
    admin.id,
    admin.username,
    "UPDATE_CATEGORY",
    category.id,
    category.name
  )

  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${categoryId}`)
  return category
}

export const deleteCategory = async (id: string) => {
  const admin = await ensureAdmin()
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

  await logCategoryAction(
    admin.id,
    admin.username,
    "DELETE_CATEGORY",
    categoryId,
    category.name
  )

  revalidatePath("/admin/categories")
  return { success: true }
}
