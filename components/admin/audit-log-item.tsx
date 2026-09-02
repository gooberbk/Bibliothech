"use client"

import * as React from "react"
import {
  BookOpen,
  Folder,
  Users,
  Shield,
  LogIn,
  LogOut,
  Trash2,
  Edit,
  Plus,
  Key,
  Settings,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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

interface AuditLogItemProps {
  log: AuditLog
  onViewDetails?: (log: AuditLog) => void
}

export function AuditLogItem({ log, onViewDetails }: AuditLogItemProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE_RESOURCE":
        return <Plus className="h-4 w-4" />
      case "UPDATE_RESOURCE":
        return <Edit className="h-4 w-4" />
      case "DELETE_RESOURCE":
        return <Trash2 className="h-4 w-4" />
      case "CREATE_CATEGORY":
        return <Plus className="h-4 w-4" />
      case "UPDATE_CATEGORY":
        return <Edit className="h-4 w-4" />
      case "DELETE_CATEGORY":
        return <Trash2 className="h-4 w-4" />
      case "UPDATE_USER_ROLE":
        return <Settings className="h-4 w-4" />
      case "CREATE_ADMIN":
        return <Shield className="h-4 w-4" />
      case "DELETE_ADMIN":
        return <Trash2 className="h-4 w-4" />
      case "UPDATE_ADMIN_PASSWORD":
        return <Key className="h-4 w-4" />
      case "TOGGLE_ADMIN_STATUS":
        return <Settings className="h-4 w-4" />
      case "LOGIN":
        return <LogIn className="h-4 w-4" />
      case "LOGOUT":
        return <LogOut className="h-4 w-4" />
      case "FAILED_LOGIN":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getEntityTypeIcon = (entityType: string | null) => {
    switch (entityType) {
      case "Resource":
        return <BookOpen className="h-4 w-4" />
      case "Category":
        return <Folder className="h-4 w-4" />
      case "User":
        return <Users className="h-4 w-4" />
      case "AdminAccount":
        return <Shield className="h-4 w-4" />
      default:
        return null
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "CREATE_RESOURCE":
        return "Création ressource"
      case "UPDATE_RESOURCE":
        return "Modification ressource"
      case "DELETE_RESOURCE":
        return "Suppression ressource"
      case "CREATE_CATEGORY":
        return "Création catégorie"
      case "UPDATE_CATEGORY":
        return "Modification catégorie"
      case "DELETE_CATEGORY":
        return "Suppression catégorie"
      case "UPDATE_USER_ROLE":
        return "Changement rôle utilisateur"
      case "CREATE_ADMIN":
        return "Création admin"
      case "DELETE_ADMIN":
        return "Suppression admin"
      case "UPDATE_ADMIN_PASSWORD":
        return "Changement mot de passe admin"
      case "TOGGLE_ADMIN_STATUS":
        return "Changement statut admin"
      case "LOGIN":
        return "Connexion"
      case "LOGOUT":
        return "Déconnexion"
      case "FAILED_LOGIN":
        return "Échec connexion"
      default:
        return action
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE_RESOURCE":
      case "CREATE_CATEGORY":
      case "CREATE_ADMIN":
        return "bg-green-500/10 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200"
      case "UPDATE_RESOURCE":
      case "UPDATE_CATEGORY":
      case "UPDATE_USER_ROLE":
      case "UPDATE_ADMIN_PASSWORD":
      case "TOGGLE_ADMIN_STATUS":
        return "bg-blue-500/10 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"
      case "DELETE_RESOURCE":
      case "DELETE_CATEGORY":
      case "DELETE_ADMIN":
        return "bg-red-500/10 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200"
      case "LOGIN":
        return "bg-green-500/10 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200"
      case "LOGOUT":
        return "bg-gray-500/10 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
      case "FAILED_LOGIN":
        return "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200"
      default:
        return "bg-gray-500/10 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const parseMetadata = (metadata: string | null) => {
    if (!metadata) return null
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }

  const metadata = parseMetadata(log.metadata)
  const entityName = metadata?.resourceTitle || metadata?.categoryName || metadata?.targetAdminUsername || metadata?.userEmail || log.entityId

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full",
        getActionColor(log.action)
      )}>
        {getActionIcon(log.action)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={getActionColor(log.action)}>
            {getActionLabel(log.action)}
          </Badge>
          {log.entityType && getEntityTypeIcon(log.entityType) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getEntityTypeIcon(log.entityType)}
              <span>{log.entityType}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">@{log.adminUsername}</span>
            {entityName && (
              <>
                <span className="text-muted-foreground">→</span>
                <span className="text-muted-foreground">{entityName}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatDate(log.createdAt)}</span>
            <span>IP: {log.ipAddress}</span>
          </div>
        </div>
      </div>

      {onViewDetails && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(log)}>
              Voir les détails
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}