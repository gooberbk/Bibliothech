"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Folder,
  ArrowLeft,
  RefreshCw,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CategoryCard } from "@/components/admin/category-card"
import { getCategories, deleteCategory } from "@/actions/category-actions"
import { toast } from "sonner"

type Category = {
  id: string
  name: string
  slug: string
  _count: {
    resources: number
  }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  const loadCategories = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCategories()
      setCategories(data)
      setFilteredCategories(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger les catégories."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadCategories()
  }, [loadCategories])

  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredCategories(categories)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
    )
    setFilteredCategories(filtered)
  }, [searchQuery, categories])

  const handleEdit = (category: Category) => {
    // Navigate to edit page - will be handled by the CategoryCard
    window.location.href = `/admin/categories/${category.id}/edit`
  }

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategory(category.id)
      toast.success("Catégorie supprimée avec succès")
      await loadCategories()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Échec de suppression"
      toast.error(message)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Catégories</h1>
            <p className="mt-1 text-muted-foreground">
              {categories.length > 0 
                ? `${categories.length} catégorie(s)` 
                : "Gérez les catégories de ressources de la bibliothèque"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCategories} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Catégorie
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClearSearch}
          >
            ×
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Chargement des catégories...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && categories.length === 0 && (
        <Card>
          <CardContent className="pt-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Folder className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Aucune catégorie pour le moment
              </p>
              <Button asChild variant="outline">
                <Link href="/admin/categories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer la première catégorie
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {!isLoading && categories.length > 0 && filteredCategories.length === 0 && (
        <Card>
          <CardContent className="pt-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                Aucune catégorie ne correspond à votre recherche
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      {!isLoading && filteredCategories.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}