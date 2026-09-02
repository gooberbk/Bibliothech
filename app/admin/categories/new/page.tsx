"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createCategory } from "@/actions/category-actions"
import { toast } from "sonner"

export default function NewCategoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [previewSlug, setPreviewSlug] = React.useState("")

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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    const loadingToastId = toast.loading("Création de la catégorie...")

    try {
      await createCategory({
        name: formData.name.trim(),
      })

      toast.dismiss(loadingToastId)
      toast.success("Catégorie créée avec succès !")
      router.push("/admin/categories")
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      toast.error(message)
      
      // Set error from server response
      if (error instanceof Error && error.message.includes("existe déjà")) {
        setErrors({ name: error.message })
      }
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle Catégorie</h1>
          <p className="mt-1 text-muted-foreground">
            Ajoutez une nouvelle catégorie à la bibliothèque.
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
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer la catégorie"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
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
