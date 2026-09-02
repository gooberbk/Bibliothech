"use client"

import * as React from "react"
import { Database, HardDrive, Shield, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSystemHealth } from "@/actions/analytics-actions"

type SystemHealth = {
  databaseStatus: "healthy" | "unhealthy"
  storageUsed: number
  storageUnit: string
  activeAdmins: number
  serverTimestamp: string
}

export function SystemHealth() {
  const [health, setHealth] = React.useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const loadHealth = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getSystemHealth()
      setHealth(data)
    } catch (error) {
      console.error("Error loading system health:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadHealth()
  }, [loadHealth])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500/10 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200"
      case "unhealthy":
        return "bg-red-500/10 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200"
      default:
        return "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Système</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    )
  }

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Système</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Impossible de charger les données système.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Santé du Système</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Base de données</span>
          </div>
          <Badge variant="outline" className={getStatusColor(health.databaseStatus)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(health.databaseStatus)}
              <span className="text-xs">
                {health.databaseStatus === "healthy" ? "En ligne" : "Hors ligne"}
              </span>
            </div>
          </Badge>
        </div>

        {/* Storage Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Stockage utilisé</span>
          </div>
          <span className="text-sm font-medium">
            {health.storageUsed} {health.storageUnit}
          </span>
        </div>

        {/* Active Admins */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Admins actifs</span>
          </div>
          <span className="text-sm font-medium">{health.activeAdmins}</span>
        </div>

        {/* Server Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Serveur</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(health.serverTimestamp).toLocaleString("fr-FR")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
