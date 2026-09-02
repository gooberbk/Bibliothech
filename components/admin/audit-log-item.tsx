"use client"

import * as React from "react"
import { Clock, AlertCircle, CheckCircle, XCircle, User, Server } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AuditLogItemProps {
  log: {
    id: string
    adminUsername: string
    action: string
    entityType?: string | null
    entityId?: string | null
    metadata?: string | null
    ipAddress: string
    createdAt: Date
  }
}

export function AuditLogItem({ log }: AuditLogItemProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "FAILED_LOGIN":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "CREATE_ADMIN":
      case "CREATE_RESOURCE":
      case "CREATE_CATEGORY":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "DELETE_ADMIN":
      case "DELETE_RESOURCE":
      case "DELETE_CATEGORY":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "UPDATE_ADMIN_PASSWORD":
      case "UPDATE_RESOURCE":
      case "UPDATE_CATEGORY":
      case "UPDATE_USER_ROLE":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Server className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-blue-500/10 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"
    if (action.includes("DELETE")) return "bg-red-500/10 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200"
    if (action.includes("UPDATE")) return "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200"
    if (action === "LOGIN") return "bg-green-500/10 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200"
    if (action === "FAILED_LOGIN") return "bg-red-500/10 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200"
    return "bg-gray-500/10 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
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

  return (
    <Card className="mb-2">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getActionIcon(log.action)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={getActionColor(log.action)}>
                {log.action}
              </Badge>
              {log.entityType && (
                <Badge variant="secondary" className="text-xs">
                  {log.entityType}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <User className="h-3 w-3" />
              <span>{log.adminUsername}</span>
              <Clock className="h-3 w-3 ml-2" />
              <span>{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            {metadata && (
              <div className="text-xs text-muted-foreground">
                {Object.entries(metadata).map(([key, value]) => (
                  <span key={key} className="mr-2">
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}