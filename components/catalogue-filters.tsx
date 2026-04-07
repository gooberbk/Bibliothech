"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { categories, documentTypes, formats } from "@/lib/data"

interface CatalogueFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  selectedTypes: string[]
  onTypesChange: (types: string[]) => void
  selectedFormats: string[]
  onFormatsChange: (formats: string[]) => void
  onReset: () => void
}

export function CatalogueFilters({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  selectedTypes,
  onTypesChange,
  selectedFormats,
  onFormatsChange,
  onReset,
}: CatalogueFiltersProps) {
  const hasFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedFormats.length > 0

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type))
    } else {
      onTypesChange([...selectedTypes, type])
    }
  }

  const toggleFormat = (format: string) => {
    if (selectedFormats.includes(format)) {
      onFormatsChange(selectedFormats.filter((f) => f !== format))
    } else {
      onFormatsChange([...selectedFormats, format])
    }
  }

  return (
    <div className="sticky top-24 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Reset button */}
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onReset} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Réinitialiser les filtres
        </Button>
      )}

      <Accordion type="multiple" defaultValue={["categories", "types", "formats"]} className="w-full">
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm font-semibold">
            Catégories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Document Types */}
        <AccordionItem value="types">
          <AccordionTrigger className="text-sm font-semibold">
            Type de Document
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {documentTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Formats */}
        <AccordionItem value="formats">
          <AccordionTrigger className="text-sm font-semibold">
            Format
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {formats.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format}`}
                    checked={selectedFormats.includes(format)}
                    onCheckedChange={() => toggleFormat(format)}
                  />
                  <Label
                    htmlFor={`format-${format}`}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {format}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
