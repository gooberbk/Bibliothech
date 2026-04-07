"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  Users,
  Download,
  HardDrive,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { books } from "@/lib/data"

const stats = [
  {
    title: "Total Ressources",
    value: "1,248",
    change: "+12%",
    changeType: "positive" as const,
    icon: BookOpen,
  },
  {
    title: "Utilisateurs Actifs",
    value: "3,842",
    change: "+8%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Téléchargements",
    value: "24,531",
    change: "+23%",
    changeType: "positive" as const,
    icon: Download,
  },
]

const recentActivities = [
  {
    type: "book",
    title: "Étude Approfondie des Processeurs",
    action: "ajouté",
    date: "Il y a 2 heures",
  },
  {
    type: "user",
    title: "Sarah Boumediene",
    action: "inscrit",
    date: "Il y a 3 heures",
  },
  {
    type: "book",
    title: "Série TD - Algèbre Linéaire",
    action: "modifié",
    date: "Il y a 5 heures",
  },
  {
    type: "user",
    title: "Karim Meziane",
    action: "inscrit",
    date: "Il y a 6 heures",
  },
  {
    type: "book",
    title: "Probabilités et Statistiques",
    action: "ajouté",
    date: "Hier",
  },
]

export default function AdminOverviewPage() {
  const storageUsed = 45
  const storageTotal = 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenue sur le tableau de bord d&apos;administration.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500">{stat.change}</span>
                <span className="text-muted-foreground">ce mois</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Storage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Espace Stockage
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {storageUsed}GB / {storageTotal}GB
            </div>
            <Progress
              value={(storageUsed / storageTotal) * 100}
              className={`mt-3 ${storageUsed / storageTotal > 0.9 ? "[&>div]:bg-destructive" : ""}`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Books */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Livres Récents</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/books" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Téléchargements</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.slice(0, 5).map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">
                      <span className="line-clamp-1">{book.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {book.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {book.downloads.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        activity.type === "book"
                          ? "bg-primary/10 text-primary"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {activity.type === "book" ? (
                        <BookOpen className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.date}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
