"use client"

import * as React from "react"
import {
  Database,
  HardDrive,
  Server,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMonitoringData, ServiceStatus } from "@/actions/monitoring-actions"
import { toast } from "sonner"

type MonitoringData = {
  overallStatus: ServiceStatus
  services: {
    database: ServiceStatus
    storage: ServiceStatus
    clerk: ServiceStatus
    uploadthing: ServiceStatus
  }
  metrics: {
    database: {
      status: ServiceStatus
      connectionTime: number
      queryTime: number
      message: string
    }
    storage: {
      status: ServiceStatus
      usagePercentage: number
      usedGB: number
      totalGB: number
      message: string
    }
    server: {
      status: ServiceStatus
      uptime: number
      memoryUsage: number
      cpuUsage: number
      message: string
    }
    admins: {
      status: ServiceStatus
      activeCount: number
      totalCount: number
      message: string
    }
  }
  timestamp: string
}

export function MonitoringDashboard() {
  const [data, setData] = React.useState<MonitoringData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [lastRefresh, setLastRefresh] = React.useState<Date | null>(null)

  const loadMonitoringData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const monitoringData = await getMonitoringData()
      setData(monitoringData)
      setLastRefresh(new Date())
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger les données de monitoring."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadMonitoringData()
  }, [loadMonitoringData])

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      loadMonitoringData()
    }, 30000)
    return () => clearInterval(interval)
  }, [loadMonitoringData])

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "unhealthy":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "unknown":
        return <HelpCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "unhealthy":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      case "unknown":
        return "text-gray-500"
    }
  }

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return "bg-green-500/10 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200"
      case "unhealthy":
        return "bg-red-500/10 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200"
      case "warning":
        return "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200"
      case "unknown":
        return "bg-gray-500/10 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}j ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (isLoading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Monitoring Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Monitoring Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Impossible de charger les données de monitoring.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Monitoring Système
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusBadge(data.overallStatus)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.overallStatus)}
                <span className="text-xs capitalize">{data.overallStatus}</span>
              </div>
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadMonitoringData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getStatusBadge(data.overallStatus)}`}>
              {getStatusIcon(data.overallStatus)}
            </div>
            <div>
              <p className="font-medium text-sm">État global</p>
              <p className="text-xs text-muted-foreground">
                {data.overallStatus === "healthy" && "Système opérationnel"}
                {data.overallStatus === "warning" && "Attention requise"}
                {data.overallStatus === "unhealthy" && "Système en difficulté"}
                {data.overallStatus === "unknown" && "État indéterminé"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {lastRefresh ? `Mis à jour: ${lastRefresh.toLocaleTimeString("fr-FR")}` : "En attente"}
            </p>
          </div>
        </div>

        {/* Database */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className={`h-4 w-4 ${getStatusColor(data.metrics.database.status)}`} />
              <span className="text-sm font-medium">Base de données</span>
            </div>
            <Badge variant="outline" className={getStatusBadge(data.metrics.database.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.metrics.database.status)}
                <span className="text-xs capitalize">{data.metrics.database.status}</span>
              </div>
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-muted-foreground">Connexion: {data.metrics.database.connectionTime}ms</div>
            <div className="text-muted-foreground">Requête: {data.metrics.database.queryTime}ms</div>
          </div>
          <p className="text-xs text-muted-foreground">{data.metrics.database.message}</p>
        </div>

        {/* Storage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className={`h-4 w-4 ${getStatusColor(data.metrics.storage.status)}`} />
              <span className="text-sm font-medium">Stockage</span>
            </div>
            <Badge variant="outline" className={getStatusBadge(data.metrics.storage.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.metrics.storage.status)}
                <span className="text-xs capitalize">{data.metrics.storage.status}</span>
              </div>
            </Badge>
          </div>
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`absolute h-full transition-all ${
                data.metrics.storage.usagePercentage < 70
                  ? "bg-green-500"
                  : data.metrics.storage.usagePercentage < 90
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${data.metrics.storage.usagePercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-muted-foreground">
              {data.metrics.storage.usedGB.toFixed(1)}GB / {data.metrics.storage.totalGB}GB
            </div>
            <div className="text-muted-foreground">
              {data.metrics.storage.usagePercentage.toFixed(1)}% utilisé
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{data.metrics.storage.message}</p>
        </div>

        {/* Server */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className={`h-4 w-4 ${getStatusColor(data.metrics.server.status)}`} />
              <span className="text-sm font-medium">Serveur</span>
            </div>
            <Badge variant="outline" className={getStatusBadge(data.metrics.server.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.metrics.server.status)}
                <span className="text-xs capitalize">{data.metrics.server.status}</span>
              </div>
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-muted-foreground">Uptime: {formatUptime(data.metrics.server.uptime)}</div>
            <div className="text-muted-foreground">Mémoire: {data.metrics.server.memoryUsage.toFixed(1)}%</div>
            <div className="text-muted-foreground">CPU: {data.metrics.server.cpuUsage.toFixed(1)}%</div>
          </div>
          <p className="text-xs text-muted-foreground">{data.metrics.server.message}</p>
        </div>

        {/* Admins */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${getStatusColor(data.metrics.admins.status)}`} />
              <span className="text-sm font-medium">Admins actifs</span>
            </div>
            <Badge variant="outline" className={getStatusBadge(data.metrics.admins.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.metrics.admins.status)}
                <span className="text-xs capitalize">{data.metrics.admins.status}</span>
              </div>
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-muted-foreground">
              {data.metrics.admins.activeCount} actif(s) / {data.metrics.admins.totalCount} total
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{data.metrics.admins.message}</p>
        </div>

        {/* External Services */}
        <div className="pt-4 border-t">
          <p className="text-xs font-medium mb-2">Services externes</p>
          <div className="flex gap-2">
            <Badge variant="outline" className={getStatusBadge(data.services.clerk)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.services.clerk)}
                <span className="text-xs">Clerk</span>
              </div>
            </Badge>
            <Badge variant="outline" className={getStatusBadge(data.services.uploadthing)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.services.uploadthing)}
                <span className="text-xs">UploadThing</span>
              </div>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}