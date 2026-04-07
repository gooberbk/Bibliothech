"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import type { Resource } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type CatalogueClientProps = {
  resources: Resource[]
}

export function CatalogueClient({ resources }: CatalogueClientProps) {
  const [query, setQuery] = React.useState("")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([])

  const categories = React.useMemo(
    () => Array.from(new Set(resources.map((r) => r.category))).sort(),
    [resources]
  )

  const types = React.useMemo(
    () => Array.from(new Set(resources.map((r) => r.type))).sort(),
    [resources]
  )

  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value))
      return
    }
    setSelected([...selected, value])
  }

  const filteredResources = React.useMemo(() => {
    const loweredQuery = query.trim().toLowerCase()
    return resources.filter((resource) => {
      const matchesQuery =
        !loweredQuery ||
        resource.title.toLowerCase().includes(loweredQuery) ||
        resource.author.toLowerCase().includes(loweredQuery) ||
        resource.category.toLowerCase().includes(loweredQuery)

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(resource.category)

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(resource.type)

      return matchesQuery && matchesCategory && matchesType
    })
  }, [query, resources, selectedCategories, selectedTypes])

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 rounded-xl border border-border bg-card p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un titre, auteur ou catégorie..."
              className="pl-9"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Catégories
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = selectedCategories.includes(category)
                return (
                  <Button
                    key={category}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      toggleFilter(
                        category,
                        selectedCategories,
                        setSelectedCategories
                      )
                    }
                  >
                    {category}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Types
            </p>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => {
                const active = selectedTypes.includes(type)
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                  >
                    {type}
                  </Button>
                )
              })}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredResources.length} ressource(s) trouvée(s)
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Link
              key={resource.id}
              href={`/book/${resource.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                <Image
                  src={resource.coverUrl}
                  alt={resource.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-4">
                <Badge variant="outline">{resource.category}</Badge>
                <h3 className="line-clamp-2 text-base font-semibold">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.author}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{resource.pageCount} pages</span>
                  <span>{resource.fileSizeMb.toFixed(1)} Mo</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Aucune ressource ne correspond a vos filtres.
          </div>
        )}
      </div>
    </section>
  )
}
