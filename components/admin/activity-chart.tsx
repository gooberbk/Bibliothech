"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActivityChartData } from "@/actions/analytics-actions"

type ActivityData = {
  downloads: Array<{ date: string; count: number }>
  favorites: Array<{ date: string; count: number }>
}

export function ActivityChart() {
  const [data, setData] = React.useState<ActivityData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const chartData = await getActivityChartData()
      setData(chartData)
    } catch (error) {
      console.error("Error loading activity chart data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadData()
  }, [loadData])

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  // Combine data for the chart
  const combinedData = React.useMemo(() => {
    if (!data) return []
    return data.downloads.map((download, index) => ({
      date: formatDate(download.date),
      Téléchargements: download.count,
      Favoris: data.favorites[index]?.count || 0,
    }))
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité des 7 derniers jours</CardTitle>
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
          <CardTitle>Activité des 7 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Impossible de charger les données d'activité.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité des 7 derniers jours</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar 
              dataKey="Téléchargements" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="Favoris" 
              fill="hsl(var(--secondary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
