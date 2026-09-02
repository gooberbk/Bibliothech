"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  RefreshCw,
  Shield,
  Users,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCard } from "@/components/admin/user-card"
import { UserFilters } from "@/components/admin/user-filters"
import { Pagination } from "@/components/admin/pagination"
import { getAdminUsers } from "@/actions/user-actions"
import { toast } from "sonner"

type User = {
  id: string
  name: string | null
  email: string | null
  role: "USER" | "ADMIN"
  createdAt: Date
  _count: {
    downloads: number
    favorites: number
    activities: number
  }
}

type PaginatedUsersResponse = {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<"ALL" | "USER" | "ADMIN">("ALL")
  const [usersData, setUsersData] = React.useState<PaginatedUsersResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 12

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        role: roleFilter,
      })
      setUsersData(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger les utilisateurs."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery, roleFilter])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, roleFilter])

  const handleEdit = (user: User) => {
    // Navigate to edit page
    window.location.href = `/admin/users/${user.id}/edit`
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setRoleFilter("ALL")
  }

  if (isLoading && !usersData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
            <p className="mt-1 text-muted-foreground">
              {usersData ? `${usersData.total} utilisateur(s)` : "Gérer les rôles et permissions"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
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
      {usersData && (
        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          selectedCount={0}
          onClearFilters={handleClearFilters}
          totalUsers={usersData.total}
        />
      )}

      {/* Empty State */}
      {!isLoading && usersData && usersData.users.length === 0 && (
        <Card>
          <CardContent className="pt-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || roleFilter !== "ALL"
                  ? "Aucun utilisateur ne correspond à vos critères"
                  : "Aucun utilisateur pour le moment"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Grid */}
      {!isLoading && usersData && usersData.users.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {usersData.users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={usersData.page}
            totalPages={usersData.totalPages}
            onPageChange={setCurrentPage}
            totalItems={usersData.total}
            itemsPerPage={usersData.limit}
          />
        </>
      )}
    </div>
  )
}