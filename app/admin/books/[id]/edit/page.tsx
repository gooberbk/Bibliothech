"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getResourceById, updateResource } from "@/actions/resource-actions"
import { getCategories } from "@/actions/category-actions"
import { toast } from "sonner"

type Resource = {
  id: string
  title: string
  author: string
  description: string | null
  category: string
  type: string
  pageCount: number
  fileSizeMb: number
  fileUrl: string
  fileKey: string
  coverUrl: string
  coverKey: string
  downloadCount: number
  createdAt: Date
}

type Category = {
  id: string
  name: string
  slug: string
}

export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [resource, setResource] = React.useState<Resource | null>(null)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [formData, setFormData] = React.useState({
    title: "",
    author: "",
    description: "",
    category: "",
    type: "",
    pageCount: "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const loadResource = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getResourceById(id)
      if (!data) {
        throw new Error("Ressource introuvable")
      }
      setResource(data)
      setFormData({
        title: data.title,
        author: data.author,
        description: data.description || "",
        category: data.category,
        type: data.type,
        pageCount: data.pageCount.toString(),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger la ressource."
      toast.error(message)
      router.push("/admin/books")
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  const loadCategories = React.useCallback(async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }, [])

  React.useEffect(() => {
    loadResource()
    loadCategories()
  }, [loadResource, loadCategories])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis"
    }
    if (!formData.author.trim()) {
      newErrors.author = "L'auteur est requis"
    }
    if (!formData.category) {
      newErrors.category = "La catégorie est requise"
    }
    if (!formData.type) {
      newErrors.type = "Le type est requis"
    }
    if (!formData.pageCount || parseInt(formData.pageCount) <= 0) {
      newErrors.pageCount = "Le nombre de pages doit être supérieur à 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)
    const loadingToastId = toast.loading("Mise à jour de la ressource...")

    try {
      await updateResource(id, {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        type: formData.type,
        pageCount: parseInt(formData.pageCount, 10),
      })

      toast.dismiss(loadingToastId)
      toast.success("Ressource mise à jour avec succès !")
      router.push("/admin/books")
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/books">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier la ressource</h1>
            <p className="mt-1 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/books">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier la ressource</h1>
            <p className="mt-1 text-muted-foreground">Ressource introuvable</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/books">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Modifier la ressource</h1>
          <p className="mt-1 text-muted-foreground">
            Modifiez les informations de {resource.title}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/book/${resource.id}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Voir la ressource
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la ressource</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Auteur *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className={errors.author ? "border-destructive" : ""}
                  />
                  {errors.author && (
                    <p className="text-xs text-destructive">{errors.author}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-xs text-destructive">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="EPUB">EPUB</SelectItem>
                        <SelectItem value="DOCX">DOCX</SelectItem>
                        <SelectItem value="OTHER">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-xs text-destructive">{errors.type}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pageCount">Nombre de pages *</Label>
                  <Input
                    id="pageCount"
                    type="number"
                    min="1"
                    value={formData.pageCount}
                    onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                    className={errors.pageCount ? "border-destructive" : ""}
                  />
                  {errors.pageCount && (
                    <p className="text-xs text-destructive">{errors.pageCount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Description de la ressource..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taille du fichier</p>
                  <p className="text-lg font-medium">{resource.fileSizeMb.toFixed(1)} Mo</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Téléchargements</p>
                  <p className="text-lg font-medium">{resource.downloadCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'ajout</p>
                  <p className="text-sm">
                    {new Date(resource.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}