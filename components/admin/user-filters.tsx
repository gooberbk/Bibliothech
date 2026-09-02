"use client"

import * as React from "react"
import { Search, X, Shield, Users, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface UserFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  roleFilter: "USER" | "ADMIN" | "ALL"
  onRoleChange: (value: "USER" | "ADMIN" | "ALL") => void
  selectedCount: number
  onClearFilters: () => void
  totalUsers: number
}

export function UserFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  selectedCount,
  onClearFilters,
  totalUsers,
}: UserFiltersProps) {
  const hasActiveFilters = searchQuery || roleFilter !== "ALL"

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tous les rôles
              </div>
            </SelectItem>
            <SelectItem value="USER">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Utilisateurs
              </div>
            </SelectItem>
            <SelectItem value="ADMIN">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admins
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Effacer
          </Button>
        )}
        
        <Badge variant="outline" className="ml-auto">
          {totalUsers} utilisateur(s)
        </Badge>
        
        {selectedCount > 0 && (
          <Badge variant="secondary">
            {selectedCount} sélectionné(s)
          </Badge>
        )}
      </div>
    </div>
  )
}