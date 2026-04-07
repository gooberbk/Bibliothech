import { z } from "zod"

export const ResourceSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  author: z.string().min(2, "L'auteur est obligatoire"),
  description: z.string().optional(),
  category: z.string().min(1, "La catégorie est requise"),
  type: z.string().min(1, "Le type de document est requis"),
  pageCount: z.number().int().positive("Doit être supérieur à 0"),
  fileSizeMb: z.number().positive(),
  fileUrl: z.string().url("URL du fichier invalide"),
  fileKey: z.string(),
  coverUrl: z.string().url("URL de couverture invalide"),
  coverKey: z.string(),
})

export const ResourceIdSchema = z.object({
  resourceId: z.string().min(1, "resourceId est requis"),
})

export const DeleteResourceSchema = z.object({
  id: z.string().min(1, "id est requis"),
})

export type CreateResourceInput = z.infer<typeof ResourceSchema>
