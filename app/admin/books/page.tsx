"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Link2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { deleteResource, getAdminResources } from "@/actions/resource-actions"
import { getCategories } from "@/actions/category-actions"
import { categoryStyles } from "@/lib/data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type AdminBook = {
  id: string
  title: string
  author: string
  category: string
  format: string
  pages: number
  size: string
  coverUrl: string
  createdAt: string
}

const getCategoryStyle = (category: string): string => {
  return categoryStyles[category as keyof typeof categoryStyles] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
}

export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [books, setBooks] = React.useState<AdminBook[]>([])
  const [isFetching, setIsFetching] = React.useState(true)
  const [fetchError, setFetchError] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [selectedBooks, setSelectedBooks] = React.useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [bookToDelete, setBookToDelete] = React.useState<AdminBook | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const loadResources = React.useCallback(async () => {
    setIsFetching(true)
    setFetchError(null)
    try {
      const rows = await getAdminResources()
      const mapped: AdminBook[] = rows.map((resource) => ({
        id: resource.id,
        title: resource.title,
        author: resource.author,
        category: resource.category,
        format: "PDF",
        pages: resource.pageCount,
        size: `${resource.fileSizeMb.toFixed(1)} Mo`,
        coverUrl: resource.coverUrl,
        createdAt: resource.createdAt.toISOString(),
      }))
      setBooks(mapped)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger les ressources."
      setFetchError(message)
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }, [])

  React.useEffect(() => {
    void loadResources()
  }, [loadResources])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const filteredBooks = React.useMemo(() => {
    if (!searchQuery) return books
    const query = searchQuery.toLowerCase()
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    )
  }, [books, searchQuery])

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const toggleSelectAll = () => {
    if (selectedBooks.length === paginatedBooks.length) {
      setSelectedBooks([])
    } else {
      setSelectedBooks(paginatedBooks.map((book) => book.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedBooks.includes(id)) {
      setSelectedBooks(selectedBooks.filter((bookId) => bookId !== id))
    } else {
      setSelectedBooks([...selectedBooks, id])
    }
  }

  const handleDelete = (book: AdminBook) => {
    setBookToDelete(book)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!bookToDelete) return

    setIsDeleting(true)
    const loadingToastId = toast.loading("Suppression en cours...")
    try {
      await deleteResource(bookToDelete.id)
      setBooks((prev) => prev.filter((book) => book.id !== bookToDelete.id))
      setSelectedBooks((prev) => prev.filter((id) => id !== bookToDelete.id))
      setDeleteDialogOpen(false)
      setBookToDelete(null)
      toast.dismiss(loadingToastId)
      toast.success("Ressource supprimée avec succès.")
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message = error instanceof Error ? error.message : "Échec de suppression."
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const copyLink = async (book: AdminBook) => {
    const url = `${window.location.origin}/book/${book.id}`
    await navigator.clipboard.writeText(url)
    toast.success("Lien copié.")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des Livres
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gérez les ressources de la bibliothèque.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/books/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une ressource
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrer par titre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {selectedBooks.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selectedBooks.length} élément(s) sélectionné(s)
          </p>
        )}
      </div>

      {fetchError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginatedBooks.length > 0 &&
                    selectedBooks.length === paginatedBooks.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Pages / Poids</TableHead>
              <TableHead>Date d&apos;ajout</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Chargement des ressources...
                </TableCell>
              </TableRow>
            ) : paginatedBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Aucune ressource trouvée.
                </TableCell>
              </TableRow>
            ) : (
              paginatedBooks.map((book) => (
                <TableRow key={book.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedBooks.includes(book.id)}
                    onCheckedChange={() => toggleSelect(book.id)}
                    aria-label={`Sélectionner ${book.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-9 overflow-hidden rounded bg-muted">
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {book.author}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      getCategoryStyle(book.category)
                    )}
                  >
                    {book.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{book.format}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {book.pages} pages / {book.size}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(book.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/books/${book.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Éditer
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyLink(book)}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Copier le lien
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(book)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {totalPages === 0 ? 0 : currentPage} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={totalPages === 0 || currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &ldquo;{bookToDelete?.title}
              &rdquo; ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
