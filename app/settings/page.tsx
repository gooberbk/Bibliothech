"use client"

import * as React from "react"
import Link from "next/link"
import { Settings, User, Shield, Bell, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { updatePrivacySettings, updateNotificationSettings } from "@/actions/profile-actions"
import { toast } from "sonner"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [settings, setSettings] = React.useState({
    profileVisible: true,
    activityVisible: true,
    emailNotifications: true,
    updateNotifications: true,
  })

  const loadSettings = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile")
      if (!response.ok) throw new Error("Impossible de charger les paramètres")
      const data = await response.json()
      setSettings({
        profileVisible: data.profileVisible ?? true,
        activityVisible: data.activityVisible ?? true,
        emailNotifications: true, // Default values for notification settings
        updateNotifications: true,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const handlePrivacyChange = async (field: "profileVisible" | "activityVisible", value: boolean) => {
    setIsSaving(true)
    try {
      await updatePrivacySettings({
        profileVisible: field === "profileVisible" ? value : settings.profileVisible,
        activityVisible: field === "activityVisible" ? value : settings.activityVisible,
      })
      setSettings({ ...settings, [field]: value })
      toast.success("Paramètres de confidentialité mis à jour")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de la mise à jour."
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNotificationChange = async (field: "emailNotifications" | "updateNotifications", value: boolean) => {
    setIsSaving(true)
    try {
      await updateNotificationSettings({
        emailNotifications: field === "emailNotifications" ? value : settings.emailNotifications,
        updateNotifications: field === "updateNotifications" ? value : settings.updateNotifications,
      })
      setSettings({ ...settings, [field]: value })
      toast.success("Paramètres de notification mis à jour")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de la mise à jour."
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
              <p className="mt-1 text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
            <p className="mt-1 text-muted-foreground">
              Gérez vos paramètres de compte et préférences
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Modifier le profil</Label>
                  <Button variant="link" className="p-0 h-auto mt-1" asChild>
                    <Link href="/profile/edit">
                      Modifier ma bio, liens sociaux et informations académiques
                    </Link>
                  </Button>
                </div>
                <div>
                  <Label>Nom et Email</Label>
                  <Button variant="link" className="p-0 h-auto mt-1" asChild>
                    <Link href="https://accounts.clerk.com/user" target="_blank">
                      Modifier dans Clerk
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visible">Profil public</Label>
                    <p className="text-xs text-muted-foreground">
                      Rendre votre profil visible par les autres utilisateurs
                    </p>
                  </div>
                  <Switch
                    id="profile-visible"
                    checked={settings.profileVisible}
                    onCheckedChange={(checked) => handlePrivacyChange("profileVisible", checked)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-visible">Activité publique</Label>
                    <p className="text-xs text-muted-foreground">
                      Afficher votre activité (favoris, téléchargements)
                    </p>
                  </div>
                  <Switch
                    id="activity-visible"
                    checked={settings.activityVisible}
                    onCheckedChange={(checked) => handlePrivacyChange("activityVisible", checked)}
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Changer de mot de passe</Label>
                  <Button variant="link" className="p-0 h-auto mt-1" asChild>
                    <Link href="https://accounts.clerk.com/user/security" target="_blank">
                      Gérer dans Clerk
                    </Link>
                  </Button>
                </div>
                <div>
                  <Label>Authentification à deux facteurs</Label>
                  <Button variant="link" className="p-0 h-auto mt-1" asChild>
                    <Link href="https://accounts.clerk.com/user/security" target="_blank">
                      Configurer dans Clerk
                    </Link>
                  </Button>
                </div>
                <div>
                  <Label>Supprimer le compte</Label>
                  <Button variant="destructive" className="mt-2" size="sm">
                    Supprimer mon compte
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notifications par email</Label>
                    <p className="text-xs text-muted-foreground">
                      Recevoir des notifications par email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="update-notifications">Mises à jour de ressources</Label>
                    <p className="text-xs text-muted-foreground">
                      Être notifié des nouvelles ressources
                    </p>
                  </div>
                  <Switch
                    id="update-notifications"
                    checked={settings.updateNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("updateNotifications", checked)}
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
