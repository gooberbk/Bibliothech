"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MoreHorizontal,
  Pencil,
  Link2,
  Trash2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
} from "lucide-react"
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
import { categoryStyles } from "@/lib/data"
import { cn } from "@/lib/utils"
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

interface ResourceTableProps {
  resources: Resource[]
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelect: (id: string) => void
  onEdit: (resource: Resource) => void
  onDelete: (resource: Resource) => void
  onCopyLink: (resource: Resource) => void
  isAllSelected: boolean
  isSomeSelected: boolean
}

const getCategoryStyle = (category: string): string => {
  return categoryStyles[category as keyof typeof categoryStyles] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
}

export function ResourceTable({
  resources,
  selectedIds,
  onSelectAll,
  onSelect,
  onEdit,
  onDelete,
  onCopyLink,
  isAllSelected,
  isSomeSelected,
}: ResourceTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [resourceToDelete, setResourceToDelete] = React.useState<Resource | null>(null)

  const handleDelete = (resource: Resource) => {
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (resourceToDelete) {
      onDelete(resourceToDelete)
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          Aucune ressource trouvée
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead className="w-16">Couverture</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Pages / Poids</TableHead>
              <TableHead>Date d&apos;ajout</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(resource.id)}
                    onCheckedChange={() => onSelect(resource.id)}
                    aria-label={`Sélectionner ${resource.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                    <Image
                      src={resource.coverUrl}
                      alt={resource.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <p className="font-medium truncate">{resource.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{resource.author}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryStyle(resource.category)}>
                    {resource.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{resource.format}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium">{resource.pages}</span> pages
                    <span className="text-muted-foreground mx-1">•</span>
                    <span className="text-muted-foreground">{resource.size}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(resource.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/book/${resource.id}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Voir la ressource
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCopyLink(resource)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copier le lien
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/books/${resource.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(resource)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &ldquo;{resourceToDelete?.title}
              &rdquo; ? Cette action est irréversible et supprimera également le fichier
              du stockage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MoreHorizontal,
  Pencil,
  Link2,
  Trash2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
} from "lucide-react"
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
import { categoryStyles } from "@/lib/data"
import { cn } from "@/lib/utils"
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

interface ResourceTableProps {
  resources: Resource[]
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelect: (id: string) => void
  onEdit: (resource: Resource) => void
  onDelete: (resource: Resource) => void
  onCopyLink: (resource: Resource) => void
  isAllSelected: boolean
  isSomeSelected: boolean
}

const getCategoryStyle = (category: string): string => {
  return categoryStyles[category as keyof typeof categoryStyles] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
}

export function ResourceTable({
  resources,
  selectedIds,
  onSelectAll,
  onSelect,
  onEdit,
  onDelete,
  onCopyLink,
  isAllSelected,
  isSomeSelected,
}: ResourceTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [resourceToDelete, setResourceToDelete] = React.useState<Resource | null>(null)

  const handleDelete = (resource: Resource) => {
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (resourceToDelete) {
      onDelete(resourceToDelete)
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          Aucune ressource trouvée
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead className="w-16">Couverture</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Pages / Poids</TableHead>
              <TableHead>Date d&apos;ajout</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(resource.id)}
                    onCheckedChange={() => onSelect(resource.id)}
                    aria-label={`Sélectionner ${resource.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                    <Image
                      src={resource.coverUrl}
                      alt={resource.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <p className="font-medium truncate">{resource.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{resource.author}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryStyle(resource.category)}>
                    {resource.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{resource.format}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium">{resource.pages}</span> pages
                    <span className="text-muted-foreground mx-1">•</span>
                    <span className="text-muted-foreground">{resource.size}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(resource.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/book/${resource.id}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Voir la ressource
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCopyLink(resource)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copier le lien
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/books/${resource.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(resource)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &ldquo;{resourceToDelete?.title}
              &rdquo; ? Cette action est irréversible et supprimera également le fichier
              du stockage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}