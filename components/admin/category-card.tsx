"use client"

import * as React from "react"
import Link from "next/link"
import {
  Folder,
  Pencil,
  Trash2,
  BookOpen,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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

type Category = {
  id: string
  name: string
  slug: string
  _count: {
    resources: number
  }
}

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const hasResources = category._count.resources > 0

  const getCategoryStyle = (categoryName: string): string => {
    return categoryStyles[categoryName as keyof typeof categoryStyles] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
  }

  const handleDelete = () => {
    if (hasResources) {
      // Cannot delete category with resources
      return
    }
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    onDelete(category)
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <Card className="group hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0",
                getCategoryStyle(category.name)
              )}>
                <Folder className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{category.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {category.slug}
                  </code>
                  {hasResources && (
                    <Badge variant="secondary" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {category._count.resources}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={hasResources}
                  className={hasResources ? "text-muted-foreground" : "text-destructive"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {hasResources && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" />
                <span>
                  {category._count.resources} ressource(s) liée(s) - suppression impossible
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &ldquo;{category.name}
              &rdquo; ? Cette action est irréversible et le slug sera libéré.
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