"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

  const loadCategory = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getCategory(id)
      if (!data) {
        throw new Error("Catégorie introuvable")
      }
      setCategory(data)
      setFormData({ name: data.name })
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
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
      router.refresh()
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
          <p className="mt-1 text-muted-foreground">
            Modifiez les informations de la catégorie.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Le slug sera régénéré automatiquement à partir du nom.
              </p>
            </div>

            {category && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Informations actuelles</Label>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Slug actuel:</span>{" "}
                    <span className="font-mono">{category.slug}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ressources:</span>{" "}
                    <Badge variant="secondary">{category._count.resources}</Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
