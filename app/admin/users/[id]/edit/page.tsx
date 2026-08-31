"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Shield, User, Download, Heart, Activity, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserDetails, updateUserRole } from "@/actions/user-actions"
import { toast } from "sonner"

type UserDetails = {
  id: string
  clerkId: string | null
  name: string | null
  email: string | null
  role: "USER" | "ADMIN"
  bio: string | null
  socialLinks: string | null
  academicInfo: string | null
  profileVisible: boolean
  activityVisible: boolean
  createdAt: Date
  _count: {
    downloads: number
    favorites: number
    activities: number
    badges: number
  }
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [user, setUser] = React.useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false)

  const loadUser = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getUserDetails(id)
      setUser(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger l'utilisateur."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    void loadUser()
  }, [loadUser])

  const handleRoleChange = async (newRole: "USER" | "ADMIN") => {
    if (!user) return

    setIsUpdatingRole(true)
    const formData = new FormData()
    formData.append("userId", user.id)
    formData.append("newRole", newRole)

    try {
      await updateUserRole(formData)
      setUser({ ...user, role: newRole })
      toast.success(`Rôle mis à jour avec succès`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de la mise à jour du rôle."
      toast.error(message)
    } finally {
      setIsUpdatingRole(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier l'utilisateur</h1>
            <p className="mt-1 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier l'utilisateur</h1>
            <p className="mt-1 text-muted-foreground">Utilisateur introuvable</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'utilisateur</h1>
          <p className="mt-1 text-muted-foreground">
            Gérer les permissions de {user.name || "cet utilisateur"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations de l'utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p className="text-lg font-medium">{user.name || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{user.email || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clerk ID</p>
                <p className="text-sm font-mono">{user.clerkId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
                <p className="text-lg font-medium">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Rôle actuel</h3>
              <Badge
                variant={user.role === "ADMIN" ? "default" : "secondary"}
                className="flex items-center gap-1 text-base px-3 py-1"
              >
                {user.role === "ADMIN" ? (
                  <>
                    <Shield className="h-4 w-4" />
                    Admin
                  </>
                ) : (
                  "Utilisateur"
                )}
              </Badge>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Changer le rôle</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRoleChange("ADMIN")}
                  variant={user.role === "ADMIN" ? "default" : "outline"}
                  disabled={user.role === "ADMIN" || isUpdatingRole}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Promouvoir Admin
                </Button>
                <Button
                  onClick={() => handleRoleChange("USER")}
                  variant={user.role === "USER" ? "default" : "outline"}
                  disabled={user.role === "USER" || isUpdatingRole}
                >
                  <User className="mr-2 h-4 w-4" />
                  Rétrograder Utilisateur
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statistiques d'activité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user._count.downloads}</p>
                  <p className="text-sm text-muted-foreground">Téléchargements</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user._count.favorites}</p>
                  <p className="text-sm text-muted-foreground">Favoris</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user._count.activities}</p>
                  <p className="text-sm text-muted-foreground">Actions totales</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user._count.badges}</p>
                  <p className="text-sm text-muted-foreground">Badges obtenus</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations supplémentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bio</p>
            <p className="text-sm">{user.bio || "Non renseignée"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Profil visible</p>
            <Badge variant={user.profileVisible ? "default" : "secondary"}>
              {user.profileVisible ? "Oui" : "Non"}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Activité visible</p>
            <Badge variant={user.activityVisible ? "default" : "secondary"}>
              {user.activityVisible ? "Oui" : "Non"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}