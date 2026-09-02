"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  BookOpen,
  Trash2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ResourceTable } from "@/components/admin/resource-table"
import { ResourceFilters } from "@/components/admin/resource-filters"
import { Pagination } from "@/components/admin/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAdminResources, deleteResource, deleteMultipleResources } from "@/actions/resource-actions"
import { getCategories } from "@/actions/category-actions"
import { toast } from "sonner"

type Resource = {
  id: string
  title: string
  author: string
  category: string
  format: string
  pages: number
  size: string
  coverUrl: string
  createdAt: string
  downloadCount?: number
}

type PaginatedResourcesResponse = {
  resources: Resource[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminBooksPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [categories, setCategories] = React.useState<string[]>([])
  const [resourcesData, setResourcesData] = React.useState<PaginatedResourcesResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  // Load categories
  const loadCategories = React.useCallback(async () => {
    try {
      const data = await getCategories()
      setCategories(data.map(c => c.name))
    } catch (err) {
      console.error("Failed to load categories:", err)
    }
  }, [])

  // Load resources with filters and pagination
  const loadResources = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminResources({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      })
      
      const mappedResources = data.resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        author: resource.author,
        category: resource.category,
        format: resource.type,
        pages: resource.pageCount,
        size: `${resource.fileSizeMb.toFixed(1)} Mo`,
        coverUrl: resource.coverUrl,
        createdAt: resource.createdAt.toISOString(),
        downloadCount: resource.downloadCount,
      }))

      setResourcesData({
        ...data,
        resources: mappedResources,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger les ressources."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery, categoryFilter])

  // Initial load
  React.useEffect(() => {
    loadCategories()
  }, [loadCategories])

  React.useEffect(() => {
    loadResources()
  }, [loadResources])

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter])

  // Clear selection when resources change
  React.useEffect(() => {
    setSelectedIds([])
  }, [resourcesData])

  const handleCopyLink = (resource: Resource) => {
    const url = `${window.location.origin}/book/${resource.id}`
    navigator.clipboard.writeText(url)
    toast.success("Lien copié dans le presse-papier")
  }

  const handleEdit = (resource: Resource) => {
    router.push(`/admin/books/${resource.id}/edit`)
  }

  const handleDelete = async (resource: Resource) => {
    try {
      await deleteResource(resource.id)
      toast.success("Ressource supprimée avec succès")
      await loadResources()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Échec de suppression"
      toast.error(message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    const loadingToastId = toast.loading("Suppression en cours...")

    try {
      await deleteMultipleResources(selectedIds)
      setSelectedIds([])
      setBulkDeleteDialogOpen(false)
      toast.dismiss(loadingToastId)
      toast.success(`${selectedIds.length} ressource(s) supprimée(s) avec succès`)
      await loadResources()
    } catch (err) {
      toast.dismiss(loadingToastId)
      const message = err instanceof Error ? err.message : "Échec de suppression"
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
  }

  const isAllSelected = resourcesData && selectedIds.length === resourcesData.resources.length
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected

  if (isLoading && !resourcesData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Livres</h1>
            <p className="mt-1 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Livres</h1>
            <p className="mt-1 text-muted-foreground">
              {resourcesData ? `${resourcesData.total} ressource(s)` : "Gérez les ressources de la bibliothèque"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadResources} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button asChild>
            <Link href="/admin/books/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une ressource
            </Link>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <ResourceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        selectedCount={selectedIds.length}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedIds.length} ressource(s) sélectionnée(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Table */}
      {resourcesData && (
        <>
          <ResourceTable
            resources={resourcesData.resources}
            selectedIds={selectedIds}
            onSelectAll={(checked) => {
              if (checked) {
                setSelectedIds(resourcesData.resources.map(r => r.id))
              } else {
                setSelectedIds([])
              }
            }}
            onSelect={(id) => {
              setSelectedIds(prev =>
                prev.includes(id)
                  ? prev.filter(i => i !== id)
                  : [...prev, id]
              )
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCopyLink={handleCopyLink}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
          />

          {/* Pagination */}
          <Pagination
            currentPage={resourcesData.page}
            totalPages={resourcesData.totalPages}
            onPageChange={setCurrentPage}
            totalItems={resourcesData.total}
            itemsPerPage={resourcesData.limit}
          />
        </>
      )}

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {selectedIds.length} ressource(s) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedIds.length} ressource(s) ? 
              Cette action est irréversible et supprimera également les fichiers du stockage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}