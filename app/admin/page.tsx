import Link from "next/link"
import {
  BookOpen,
  Plus,
  Users,
  Folder,
  KeyRound,
  Download,
  Heart,
  RefreshCw,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MonitoringDashboard } from "@/components/admin/monitoring-dashboard"
import { ActivityChart } from "@/components/admin/activity-chart"
import { getDashboardStats, getTopResources, getTopUsers } from "@/actions/analytics-actions"

type DashboardStats = {
  totalResources: number
  totalUsers: number
  totalAdmins: number
  totalCategories: number
  totalDownloads: number
  totalFavorites: number
}

type TopResource = {
  id: string
  title: string
  author: string
  category: string
  downloadCount: number
  createdAt: Date
}

type TopUser = {
  id: string
  name: string | null
  email: string | null
  _count: {
    downloads: number
    favorites: number
    activities: number
  }
}

type QuickAction = {
  title: string
  description: string
  href: string
  icon: React.ElementType
  badge?: string
}

const quickActions: QuickAction[] = [
  {
    title: "Ajouter une ressource",
    description: "Importer un nouveau document",
    href: "/admin/books/new",
    icon: BookOpen,
  },
  {
    title: "Créer une catégorie",
    description: "Ajouter un nouveau module",
    href: "/admin/categories/new",
    icon: Folder,
  },
  {
    title: "Gérer les utilisateurs",
    description: "Administrer les membres",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Ajouter un admin",
    description: "Créer un compte administrateur",
    href: "/admin/admins",
    icon: KeyRound,
    badge: "Sécurité",
  },
]

export default async function AdminOverviewPage() {
  let stats: DashboardStats
  let topResources: TopResource[]
  let topUsers: TopUser[]
  let error: string | null = null

  try {
    stats = await getDashboardStats()
    topResources = await getTopResources(5)
    topUsers = await getTopUsers(5)
  } catch (err) {
    error = err instanceof Error ? err.message : "Impossible de charger les données du dashboard"
    // Set default values to prevent crashes
    stats = {
      totalResources: 0,
      totalUsers: 0,
      totalAdmins: 0,
      totalCategories: 0,
      totalDownloads: 0,
      totalFavorites: 0,
    }
    topResources = []
    topUsers = []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vue d'ensemble</h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenue sur le tableau de bord d'administration.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Link>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="group flex flex-col gap-2 rounded-lg border p-4 transition-all hover:border-primary hover:bg-primary/5">
                  <div className="flex items-start justify-between">
                    <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ressources
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalResources}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalResources === 0 ? "Aucune ressource" : "Documents disponibles"}
            </p>
            {stats.totalResources > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                <span>Catalogue actif</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalUsers === 0 ? "Aucun utilisateur" : "Membres inscrits"}
            </p>
            {stats.totalUsers > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                <span>Communauté en croissance</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catégories
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalCategories === 0 ? "Aucune catégorie" : "Modules disponibles"}
            </p>
            {stats.totalCategories > 0 && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Organisation complète
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalAdmins === 0 ? "Aucun admin" : "Comptes actifs"}
            </p>
            {stats.totalAdmins > 0 && (
              <div className="mt-2">
                <Badge variant={stats.totalAdmins === 1 ? "destructive" : "default"} className="text-xs">
                  {stats.totalAdmins === 1 ? "Admin unique" : "Équipe admin"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Téléchargements
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalDownloads === 0 ? "Aucun téléchargement" : "Total téléchargements"}
            </p>
            {stats.totalResources > 0 && stats.totalDownloads > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  {(stats.totalDownloads / stats.totalResources).toFixed(1)}
                </span>{" "}
                dl/ressource en moyenne
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Favoris
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalFavorites}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalFavorites === 0 ? "Aucun favori" : "Total favoris"}
            </p>
            {stats.totalUsers > 0 && stats.totalFavorites > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  {(stats.totalFavorites / stats.totalUsers).toFixed(1)}
                </span>{" "}
                fav/utilisateur en moyenne
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <MonitoringDashboard />
        </Card>
      </div>

      <ActivityChart />

      {/* Top Resources & Users */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ressources les plus téléchargées
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucune ressource pour le moment.
                </p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href="/admin/books/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter la première ressource
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {topResources.map((resource, index) => (
                  <Link
                    key={resource.id}
                    href={`/book/${resource.id}`}
                    className="group block"
                  >
                    <div className="flex items-center justify-between rounded-lg border p-3 transition-all hover:border-primary hover:bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{resource.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{resource.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {resource.category}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{resource.downloadCount}</p>
                          <p className="text-xs text-muted-foreground">téléchargements</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Utilisateurs les plus actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun utilisateur pour le moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topUsers.map((user, index) => (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}/edit`}
                    className="group block"
                  >
                    <div className="flex items-center justify-between rounded-lg border p-3 transition-all hover:border-primary hover:bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.name || "Utilisateur sans nom"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Heart className="h-3 w-3" />
                          <span>{user._count.favorites}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user._count.downloads}</p>
                          <p className="text-xs text-muted-foreground">téléchargements</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
