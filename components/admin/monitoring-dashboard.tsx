"use client"

import * as React from "react"
import { Database, HardDrive, Shield, Clock, AlertTriangle, Activity, Users, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMonitoringData, getRecentAlerts } from "@/actions/monitoring-actions"

type MonitoringData = {
  users: {
    total: number
    active: number
    growthRate: number
  }
  resources: {
    total: number
    avgDownloads: number
  }
  system: {
    uptime: number
    avgResponseTime: number
    dbConnectionPool: number
    memoryUsage: number
  }
  activity: {
    last24h: number
    trend: 'up' | 'down' | 'stable'
  }
  admins: {
    total: number
    activeSessions: number
  }
}

type Alert = {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: Date
  resolved: boolean
}

export function MonitoringDashboard() {
  const [data, setData] = React.useState<MonitoringData | null>(null)
  const [alerts, setAlerts] = React.useState<Alert[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [monitoringData, recentAlerts] = await Promise.all([
        getMonitoringData(),
        getRecentAlerts(5)
      ])
      setData(monitoringData)
      setAlerts(recentAlerts)
    } catch (error) {
      console.error("Error loading monitoring data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadData()
    // Refresh every 30 seconds
    const interval = setInterval(() => void loadData(), 30000)
    return () => clearInterval(interval)
  }, [loadData])

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200"
      case 'error':
        return "bg-red-500/10 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200"
      case 'info':
        return "bg-blue-500/10 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"
      default:
        return "bg-gray-500/10 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
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
        <CardTitle className="text-sm font-medium">Monitoring Système</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-sm font-medium">{data.system.uptime}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Response Time</p>
              <p className="text-sm font-medium">{data.system.avgResponseTime}ms</p>
            </div>
          </div>
        </div>

        {/* Memory & Database */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Memory</p>
              <p className="text-sm font-medium">{data.system.memoryUsage}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">DB Pool</p>
              <p className="text-sm font-medium">{data.system.dbConnectionPool}</p>
            </div>
          </div>
        </div>

        {/* Users & Resources */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Users</p>
              <p className="text-sm font-medium">{data.users.active}/{data.users.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Resources</p>
              <p className="text-sm font-medium">{data.resources.total}</p>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Activity (24h)</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{data.activity.last24h}</p>
              <Badge variant="outline" className="text-xs">
                {data.activity.trend === 'up' ? '↑' : data.activity.trend === 'down' ? '↓' : '→'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs font-medium mb-2">Alertes récentes</p>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className={`h-3 w-3 mt-0.5 ${
                    alert.type === 'error' ? 'text-red-500' : 
                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-muted-foreground">{alert.message}</p>
                    <p className="text-muted-foreground/70">
                      {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}