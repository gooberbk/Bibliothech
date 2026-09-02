"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, Shield, User, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getUserById, updateUserRole } from "@/actions/user-actions"
import { toast } from "sonner"

type User = {
  id: string
  name: string | null
  email: string | null
  role: "USER" | "ADMIN"
  createdAt: Date
  _count: {
    downloads: number
    favorites: number
    activities: number
  }
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [formData, setFormData] = React.useState({
    role: "USER" as "USER" | "ADMIN",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [adminCount, setAdminCount] = React.useState(0)

  const loadUser = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getUserById(id)
      if (!data) {
        throw new Error("Utilisateur introuvable")
      }
      setUser(data)
      setFormData({ role: data.role })
      
      // Get admin count for warning
      const allUsers = await fetch("/api/admin/users-count")
      if (allUsers.ok) {
        const { count } = await allUsers.json()
        setAdminCount(count)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger l'utilisateur."
      toast.error(message)
      router.push("/admin/users")
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  React.useEffect(() => {
    loadUser()
  }, [loadUser])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.role) {
      newErrors.role = "Le rôle est requis"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)
    const loadingToastId = toast.loading("Mise à jour de l'utilisateur...")

    try {
      const formDataObj = new FormData()
      formDataObj.append("userId", id)
      formDataObj.append("newRole", formData.role)

      await updateUserRole(formDataObj)

      toast.dismiss(loadingToastId)
      toast.success("Rôle mis à jour avec succès !")
      router.push("/admin/users")
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      toast.error(message)
      
      if (error instanceof Error) {
        if (error.message.includes("dernier administrateur")) {
          setErrors({ role: error.message })
        } else if (error.message.includes("votre propre rôle")) {
          setErrors({ role: error.message })
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
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

  const isAdmin = user.role === "ADMIN"
  const isAdminCount = adminCount <= 1 && isAdmin
  const wouldBeLastAdmin = isAdminCount && formData.role === "USER"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'utilisateur</h1>
          <p className="mt-1 text-muted-foreground">
            Gérer le rôle et les permissions de {user.name || user.email}
          </p>
        </div>
      </div>

      {wouldBeLastAdmin && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention :</strong> C'est le dernier administrateur. Vous ne pouvez pas le rétrograder en utilisateur standard.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rôle et permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "USER" | "ADMIN") => setFormData({ ...formData, role: value })}
                    disabled={wouldBeLastAdmin}
                  >
                    <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Utilisateur
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrateur
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-xs text-destructive">{errors.role}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Les administrateurs ont accès à toutes les fonctionnalités du dashboard.
                  </p>
                </div>

                {formData.role === "ADMIN" && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Permissions administrateur</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Gestion des ressources</p>
                          <p className="text-xs text-muted-foreground">Créer, modifier et supprimer des ressources</p>
                        </div>
                        <Switch checked disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Gestion des catégories</p>
                          <p className="text-xs text-muted-foreground">Créer, modifier et supprimer des catégories</p>
                        </div>
                        <Switch checked disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Gestion des utilisateurs</p>
                          <p className="text-xs text-muted-foreground">Modifier les rôles et permissions</p>
                        </div>
                        <Switch checked disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Accès aux analytics</p>
                          <p className="text-xs text-muted-foreground">Voir les statistiques et rapports</p>
                        </div>
                        <Switch checked disabled />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="font-medium">{user.name || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rôle actuel</p>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "Administrateur" : "Utilisateur"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Téléchargements</p>
                  <p className="text-lg font-medium">{user._count.downloads}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Favoris</p>
                  <p className="text-lg font-medium">{user._count.favorites}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actions totales</p>
                  <p className="text-lg font-medium">{user._count.activities}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSaving || wouldBeLastAdmin}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}