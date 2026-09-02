"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  RefreshCw,
  Filter,
  FileText,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuditLogItem } from "@/components/admin/audit-log-item"
import { Pagination } from "@/components/admin/pagination"
import { getAuditLogs, getAuditActions, getAuditEntityTypes, getAuditAdmins } from "@/actions/audit-actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AuditLog = {
  id: string
  adminId: string
  adminUsername: string
  action: string
  entityType: string | null
  entityId: string | null
  metadata: string | null
  ipAddress: string
  userAgent: string
  createdAt: Date
}

type PaginatedAuditLogs = {
  logs: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminAuditPage() {
  const [logsData, setLogsData] = React.useState<PaginatedAuditLogs | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState({
    action: "",
    entityType: "",
    adminId: "",
    startDate: "",
    endDate: "",
  })
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 20

  const [availableActions, setAvailableActions] = React.useState<string[]>([])
  const [availableEntityTypes, setAvailableEntityTypes] = React.useState<string[]>([])
  const [availableAdmins, setAvailableAdmins] = React.useState<Array<{ adminId: string; adminUsername: string }>>([])

  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false)
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null)

  const loadAuditLogs = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAuditLogs({
        page: currentPage,
        limit: itemsPerPage,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        adminId: filters.adminId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      setLogsData(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger les logs d'audit."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, filters])

  const loadFiltersData = React.useCallback(async () => {
    try {
      const [actions, entityTypes, admins] = await Promise.all([
        getAuditActions(),
        getAuditEntityTypes(),
        getAuditAdmins(),
      ])
      setAvailableActions(actions)
      setAvailableEntityTypes(entityTypes)
      setAvailableAdmins(admins)
    } catch (err) {
      console.error("Failed to load filters data:", err)
    }
  }, [])

  React.useEffect(() => {
    loadAuditLogs()
    loadFiltersData()
  }, [loadAuditLogs, loadFiltersData])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleClearFilters = () => {
    setFilters({
      action: "",
      entityType: "",
      adminId: "",
      startDate: "",
      endDate: "",
    })
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailsDialogOpen(true)
  }

  const parseMetadata = (metadata: string | null) => {
    if (!metadata) return null
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }

  if (isLoading && !logsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historique d'Actions</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Historique d'Actions</h1>
            <p className="mt-1 text-muted-foreground">
              {logsData ? `${logsData.total} action(s) enregistrée(s)` : "Journal d'audit des actions administrateur"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAuditLogs} disabled={isLoading}>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les actions</SelectItem>
                  {availableActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'entité</label>
              <Select value={filters.entityType} onValueChange={(value) => setFilters({ ...filters, entityType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  {availableEntityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin</label>
              <Select value={filters.adminId} onValueChange={(value) => setFilters({ ...filters, adminId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les admins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les admins</SelectItem>
                  {availableAdmins.map((admin) => (
                    <SelectItem key={admin.adminId} value={admin.adminId}>
                      @{admin.adminUsername}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date début</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date fin</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Chargement des logs...</p>
            </div>
          </CardContent>
        </Card>
      ) : logsData && logsData.logs.length === 0 ? (
        <Card>
          <CardContent className="pt-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Aucune action enregistrée
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {logsData?.logs.map((log) => (
              <AuditLogItem
                key={log.id}
                log={log}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {logsData && (
            <Pagination
              currentPage={logsData.page}
              totalPages={logsData.totalPages}
              onPageChange={setCurrentPage}
              totalItems={logsData.total}
              itemsPerPage={logsData.limit}
            />
          )}
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'action</DialogTitle>
            <DialogDescription>
              {selectedLog && new Date(selectedLog.createdAt).toLocaleString("fr-FR")}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admin</p>
                  <p className="font-medium">@{selectedLog.adminUsername}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type d'entité</p>
                  <p className="font-medium">{selectedLog.entityType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID entité</p>
                  <p className="font-mono text-sm">{selectedLog.entityId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adresse IP</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedLog.userAgent}</p>
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Métadonnées</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                    {JSON.stringify(parseMetadata(selectedLog.metadata), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  RefreshCw,
  Filter,
  FileText,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuditLogItem } from "@/components/admin/audit-log-item"
import { Pagination } from "@/components/admin/pagination"
import { getAuditLogs, getAuditActions, getAuditEntityTypes, getAuditAdmins } from "@/actions/audit-actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AuditLog = {
  id: string
  adminId: string
  adminUsername: string
  action: string
  entityType: string | null
  entityId: string | null
  metadata: string | null
  ipAddress: string
  userAgent: string
  createdAt: Date
}

type PaginatedAuditLogs = {
  logs: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminAuditPage() {
  const [logsData, setLogsData] = React.useState<PaginatedAuditLogs | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState({
    action: "",
    entityType: "",
    adminId: "",
    startDate: "",
    endDate: "",
  })
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 20

  const [availableActions, setAvailableActions] = React.useState<string[]>([])
  const [availableEntityTypes, setAvailableEntityTypes] = React.useState<string[]>([])
  const [availableAdmins, setAvailableAdmins] = React.useState<Array<{ adminId: string; adminUsername: string }>>([])

  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false)
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null)

  const loadAuditLogs = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAuditLogs({
        page: currentPage,
        limit: itemsPerPage,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        adminId: filters.adminId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      setLogsData(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger les logs d'audit."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, filters])

  const loadFiltersData = React.useCallback(async () => {
    try {
      const [actions, entityTypes, admins] = await Promise.all([
        getAuditActions(),
        getAuditEntityTypes(),
        getAuditAdmins(),
      ])
      setAvailableActions(actions)
      setAvailableEntityTypes(entityTypes)
      setAvailableAdmins(admins)
    } catch (err) {
      console.error("Failed to load filters data:", err)
    }
  }, [])

  React.useEffect(() => {
    loadAuditLogs()
    loadFiltersData()
  }, [loadAuditLogs, loadFiltersData])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleClearFilters = () => {
    setFilters({
      action: "",
      entityType: "",
      adminId: "",
      startDate: "",
      endDate: "",
    })
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailsDialogOpen(true)
  }

  const parseMetadata = (metadata: string | null) => {
    if (!metadata) return null
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }

  if (isLoading && !logsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historique d'Actions</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Historique d'Actions</h1>
            <p className="mt-1 text-muted-foreground">
              {logsData ? `${logsData.total} action(s) enregistrée(s)` : "Journal d'audit des actions administrateur"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAuditLogs} disabled={isLoading}>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les actions</SelectItem>
                  {availableActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'entité</label>
              <Select value={filters.entityType} onValueChange={(value) => setFilters({ ...filters, entityType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  {availableEntityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin</label>
              <Select value={filters.adminId} onValueChange={(value) => setFilters({ ...filters, adminId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les admins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les admins</SelectItem>
                  {availableAdmins.map((admin) => (
                    <SelectItem key={admin.adminId} value={admin.adminId}>
                      @{admin.adminUsername}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date début</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date fin</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Chargement des logs...</p>
            </div>
          </CardContent>
        </Card>
      ) : logsData && logsData.logs.length === 0 ? (
        <Card>
          <CardContent className="pt-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Aucune action enregistrée
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {logsData?.logs.map((log) => (
              <AuditLogItem
                key={log.id}
                log={log}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {logsData && (
            <Pagination
              currentPage={logsData.page}
              totalPages={logsData.totalPages}
              onPageChange={setCurrentPage}
              totalItems={logsData.total}
              itemsPerPage={logsData.limit}
            />
          )}
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'action</DialogTitle>
            <DialogDescription>
              {selectedLog && new Date(selectedLog.createdAt).toLocaleString("fr-FR")}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admin</p>
                  <p className="font-medium">@{selectedLog.adminUsername}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type d'entité</p>
                  <p className="font-medium">{selectedLog.entityType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID entité</p>
                  <p className="font-mono text-sm">{selectedLog.entityId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adresse IP</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedLog.userAgent}</p>
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Métadonnées</p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-48">
                    {JSON.stringify(parseMetadata(selectedLog.metadata), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}