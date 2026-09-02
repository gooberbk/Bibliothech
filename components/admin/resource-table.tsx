"use client"

import * as React from "react"
import { ExternalLink, MoreHorizontal, Copy, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Resource {
  id: string
  title: string
  author: string
  category: string
  type: string
  pageCount: number
  fileSizeMb: number
  coverUrl: string
  createdAt: Date
  downloadCount: number
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
}: ResourceTableProps) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">Aucune ressource trouvée.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
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
                <div className="relative h-12 w-16 overflow-hidden rounded-md">
                  <Image
                    src={resource.coverUrl}
                    alt={resource.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">{resource.author}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {resource.category}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {resource.type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  <p>{resource.pageCount} pages</p>
                  <p className="text-muted-foreground">{resource.fileSizeMb.toFixed(1)} MB</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  <p>{new Date(resource.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p className="text-muted-foreground">{resource.downloadCount} téléchargements</p>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onCopyLink(resource)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copier le lien
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(resource)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(resource)}
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
  )
}