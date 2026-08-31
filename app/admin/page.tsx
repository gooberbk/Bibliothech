import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  Plus,
  Users,
  Folder,
  Award,
} from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { syncClerkUser } from "@/lib/clerk-sync"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AdminOverviewPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // Sync Clerk user with database
  await syncClerkUser(userId, {})

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  const [totalResources, totalUsers] = await Promise.all([
    db.resource.count(),
    db.user.count(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenue sur le tableau de bord d&apos;administration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ressources
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalResources}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membres inscrits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catégories
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">
              Modules disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Récompenses disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/admin/books/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une ressource
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/categories/new">
              <Folder className="mr-2 h-4 w-4" />
              Nouvelle catégorie
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Gérer les utilisateurs
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
