"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, AlertCircle, BookOpen, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCategory, updateCategory } from "@/actions/category-actions"
import { toast } from "sonner"

type Category = {
  id: string
  name: string
  slug: string
  _count: {
    resources: number
  }
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [category, setCategory] = React.useState<Category | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [previewSlug, setPreviewSlug] = React.useState("")
  const [previewSlug, setPreviewSlug] = React.useState("")

  const loadCategory = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getCategory(id)
      if (!data) {
        throw new Error("Catégorie introuvable")
      }
      setCategory(data)
      setFormData({ name: data.name })
      setPreviewSlug(data.slug)
      setPreviewSlug(data.slug)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger la catégorie."
      toast.error(message)
      router.push("/admin/categories")
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  React.useEffect(() => {
    void loadCategory()
  }, [loadCategory])

  // Generate slug preview as user types
  React.useEffect(() => {
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setPreviewSlug(slug)
  }, [formData.name])

  // Generate slug preview as user types
  React.useEffect(() => {
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setPreviewSlug(slug)
  }, [formData.name])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    } else if (formData.name.length > 100) {
      newErrors.name = "Le nom ne peut pas dépasser 100 caractères"
    } else if (!/^[a-zA-Z0-9\sÀ-ÿ-]+$/.test(formData.name)) {
      newErrors.name = "Caractères invalides (lettres, chiffres, espaces et tirets uniquement)"
    } else if (formData.name.length > 100) {
      newErrors.name = "Le nom ne peut pas dépasser 100 caractères"
    } else if (!/^[a-zA-Z0-9\sÀ-ÿ-]+$/.test(formData.name)) {
      newErrors.name = "Caractères invalides (lettres, chiffres, espaces et tirets uniquement)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)
    const loadingToastId = toast.loading("Mise à jour de la catégorie...")

    try {
      await updateCategory({
        id,
        name: formData.name.trim(),
      })

      toast.dismiss(loadingToastId)
      toast.success("Catégorie mise à jour avec succès !")
      router.push("/admin/categories")
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      toast.error(message)
      
      // Set error from server response
      if (error instanceof Error && error.message.includes("existe déjà")) {
        setErrors({ name: error.message })
      }
      
      // Set error from server response
      if (error instanceof Error && error.message.includes("existe déjà")) {
        setErrors({ name: error.message })
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier la catégorie</h1>
            <p className="mt-1 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier la catégorie</h1>
            <p className="mt-1 text-muted-foreground">Catégorie introuvable</p>
          </div>
        </div>
      </div>
    )
  }

  const hasResources = category._count.resources > 0

  if (!category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier la catégorie</h1>
            <p className="mt-1 text-muted-foreground">Catégorie introuvable</p>
          </div>
        </div>
      </div>
    )
  }

  const hasResources = category._count.resources > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Modifier la catégorie</h1>
          <p className="mt-1 text-muted-foreground">
            Modifiez les informations de {category.name}
          </p>
        </div>
      </div>

      {hasResources && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention :</strong> Cette catégorie contient {category._count.resources} ressource(s). 
            Le changement de nom mettra à jour toutes les ressources associées.
          </AlertDescription>
        </Alert>
      )}

      {hasResources && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention :</strong> Cette catégorie contient {category._count.resources} ressource(s). 
            Le changement de nom mettra à jour toutes les ressources associées.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la catégorie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Mathématiques"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-destructive" : ""}
                    maxLength={100}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Lettres, chiffres, espaces et tirets uniquement. Max 100 caractères.
                  </p>
                </div>

                {previewSlug && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Slug généré: <code className="bg-muted px-1.5 py-0.5 rounded">{previewSlug}</code>
                      {previewSlug !== category.slug && (
                        <span className="ml-2 text-muted-foreground">(sera différent de l'actuel)</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations actuelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Slug actuel</p>
                  <p className="font-mono text-sm">{category.slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ressources</p>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={hasResources ? "default" : "secondary"}>
                      {category._count.resources}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p className="text-sm">
                    {new Date(category.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p className="text-sm">
                    {new Date(category.createdAt).toLocaleDateString("fr-FR")}
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
                    "Enregistrer"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
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
          </div>
        </div>
      </form>
    </div>
  )
}
