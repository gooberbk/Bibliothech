"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Book {
  id: string
  title: string
  author: string
  category: string
  type: string
  format: string
  pages: number
  size: string
  coverUrl: string
  downloads: number
  views: number
  createdAt: string
}

const categoryStyles: Record<string, string> = {
  "Architecture": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  "Mathématiques": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "Probabilités": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "Physique": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "Électromagnétisme": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "Algorithmique": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "Base de données": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  "Systèmes d'Exploitation": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:shadow-md dark:hover:border-primary/50">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button variant="secondary" size="sm">
              Voir détails
            </Button>
          </div>
          {/* Format badge */}
          <Badge 
            variant="secondary" 
            className="absolute right-2 top-2 text-xs uppercase"
          >
            {book.format}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4">
          <Badge 
            variant="outline" 
            className={cn(
              "mb-2 text-xs",
              categoryStyles[book.category] || "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            )}
          >
            {book.category}
          </Badge>
          
          <h3 className="line-clamp-1 text-lg font-semibold text-foreground">
            {book.title}
          </h3>
          
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {book.author}
          </p>

          {/* Stats */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {book.views}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {book.downloads}
            </span>
            <span className="ml-auto">{book.pages} pages</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function BookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[2/3] animate-pulse bg-muted" />
      <div className="p-4">
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="mt-3 h-5 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded-md bg-muted" />
        <div className="mt-3 flex gap-3">
          <div className="h-4 w-12 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-12 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}
