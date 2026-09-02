"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  RefreshCw,
  Shield,
  ArrowLeft,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminCard } from "@/components/admin/admin-card"
import { getAdminAccounts, createAdminAccount, toggleAdminAccount, deleteAdminAccount, updateAdminPassword, getAdminLoginHistory } from "@/actions/admin-account-actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type Admin = {
  id: string
  username: string
  name: string | null
  active: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

type LoginHistory = {
  id: string
  ipAddress: string
  userAgent: string
  success: boolean
  failureReason: string | null
  createdAt: Date
}

export default function AdminAccountsPage() {
  const [admins, setAdmins] = React.useState<Admin[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [currentAdminId, setCurrentAdminId] = React.useState<string | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    username: "",
    password: "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loginHistoryDialogOpen, setLoginHistoryDialogOpen] = React.useState(false)
  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null)
  const [loginHistory, setLoginHistory] = React.useState<LoginHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false)
  const [passwordForm, setPasswordForm] = React.useState({
    id: "",
    password: "",
  })

  const loadAdmins = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminAccounts()
      setAdmins(data)
      
      // Get current admin ID for self-check
      // This would normally come from the session
      // For now, we'll handle it differently
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger les comptes admin."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  const isActiveAdminCount = admins.filter(a => a.active).length

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Le nom utilisateur est requis"
    } else if (formData.username.length < 3) {
      newErrors.username = "Minimum 3 caractères"
    } else if (!/^[a-z0-9._-]+$/i.test(formData.username)) {
      newErrors.username = "Caractères invalides (lettres, chiffres, points, tirets, underscores)"
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 caractères"
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Doit contenir une majuscule"
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Doit contenir une minuscule"
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Doit contenir un chiffre"
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = "Doit contenir un caractère spécial"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsCreating(true)
    const loadingToastId = toast.loading("Création du compte admin...")

    try {
      const formDataObj = new FormData()
      formDataObj.append("username", formData.username.trim())
      formDataObj.append("password", formData.password)
      formDataObj.append("name", formData.name.trim())

      await createAdminAccount(formDataObj)

      toast.dismiss(loadingToastId)
      toast.success("Compte admin créé avec succès !")
      setFormData({ name: "", username: "", password: "" })
      await loadAdmins()
    } catch (err) {
      toast.dismiss(loadingToastId)
      const message = err instanceof Error ? err.message : "Une erreur est survenue."
      toast.error(message)
      
      if (err instanceof Error && err.message.includes("déjà utilisé")) {
        setErrors({ username: err.message })
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleStatus = async (admin: Admin) => {
    try {
      const formDataObj = new FormData()
      formDataObj.append("id", admin.id)
      formDataObj.append("active", String(!admin.active))

      await toggleAdminAccount(formDataObj)
      toast.success(`Compte ${admin.active ? "désactivé" : "activé"} avec succès`)
      await loadAdmins()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue."
      toast.error(message)
    }
  }

  const handleDelete = async (admin: Admin) => {
    try {
      const formDataObj = new FormData()
      formDataObj.append("id", admin.id)

      await deleteAdminAccount(formDataObj)
      toast.success("Compte admin supprimé avec succès")
      await loadAdmins()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue."
      toast.error(message)
    }
  }

  const handleChangePassword = async (admin: Admin) => {
    setPasswordForm({ id: admin.id, password: "" })
    setPasswordDialogOpen(true)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordForm.password) {
      toast.error("Le mot de passe est requis")
      return
    }

    if (passwordForm.password.length < 8) {
      toast.error("Minimum 8 caractères")
      return
    }

    const loadingToastId = toast.loading("Modification du mot de passe...")

    try {
      const formDataObj = new FormData()
      formDataObj.append("id", passwordForm.id)
      formDataObj.append("password", passwordForm.password)

      await updateAdminPassword(formDataObj)

      toast.dismiss(loadingToastId)
      toast.success("Mot de passe modifié avec succès")
      setPasswordDialogOpen(false)
      setPasswordForm({ id: "", password: "" })
    } catch (err) {
      toast.dismiss(loadingToastId)
      const message = err instanceof Error ? err.message : "Une erreur est survenue."
      toast.error(message)
    }
  }

  const handleViewHistory = async (admin: Admin) => {
    setSelectedAdmin(admin)
    setLoginHistoryDialogOpen(true)
    setIsLoadingHistory(true)

    try {
      const history = await getAdminLoginHistory(admin.id)
      setLoginHistory(history)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger l'historique."
      toast.error(message)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // For self-check, we'll use a simple approach
  // In production, this would come from the session
  const isSelf = (adminId: string) => {
    // This is a placeholder - in production, get the actual current admin ID from session
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Admins</h1>
            <p className="mt-1 text-muted-foreground">
              {admins.length > 0 
                ? `${admins.length} compte(s) admin, ${isActiveAdminCount} actif(s)` 
                : "Gérer les comptes qui peuvent accéder au dashboard"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAdmins} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Create Admin Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nouveau compte admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet (optionnel)</Label>
              <Input
                id="name"
                placeholder="Mahdi BOUKENDOUL"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nom utilisateur *</Label>
              <Input
                id="username"
                placeholder="mahdi"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                placeholder="8+ caractères, majuscule, minuscule, chiffre, spécial"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Création..." : "Créer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admins Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Chargement des comptes admin...</p>
            </div>
          </CardContent>
        </Card>
      ) : admins.length === 0 ? (
        <Card>
          <CardContent className="pt-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Aucun compte admin pour le moment
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onToggleStatus={handleToggleStatus}
              onChangePassword={handleChangePassword}
              onDelete={handleDelete}
              onViewHistory={handleViewHistory}
              isSelf={isSelf(admin.id)}
              isActiveAdminCount={isActiveAdminCount}
            />
          ))}
        </div>
      )}

      {/* Login History Dialog */}
      <Dialog open={loginHistoryDialogOpen} onOpenChange={setLoginHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historique de connexion</DialogTitle>
            <DialogDescription>
              {selectedAdmin && `@${selectedAdmin.username} (${selectedAdmin.name || "Sans nom"})`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Aucun historique de connexion</p>
              </div>
            ) : (
              <div className="space-y-2">
                {loginHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={entry.success ? "default" : "destructive"}>
                          {entry.success ? "Succès" : "Échec"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="font-mono text-xs">{entry.ipAddress}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.userAgent}
                        </p>
                      </div>
                      {entry.failureReason && (
                        <p className="text-xs text-destructive mt-1">
                          {entry.failureReason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Définissez un nouveau mot de passe pour ce compte admin
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe *</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="8+ caractères, majuscule, minuscule, chiffre, spécial"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 caractères, incluant majuscule, minuscule, chiffre et caractère spécial
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                Changer le mot de passe
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}