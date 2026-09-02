"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
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
          <LineChart data={combinedData}>
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
            <Line 
              type="monotone"
              dataKey="Téléchargements" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
            <Line 
              type="monotone"
              dataKey="Favoris" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--secondary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}