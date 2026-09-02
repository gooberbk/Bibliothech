"use client"

import * as React from "react"
import { MoreHorizontal, Edit, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Category {
  id: string
  name: string
  slug: string
  createdAt: Date
}

interface CategoryCardProps {
  category: Category
  resourceCount?: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({ category, resourceCount = 0, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{category.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{category.slug}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(category)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{resourceCount} ressource(s)</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Créé le {new Date(category.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </CardContent>
    </Card>
  )
}