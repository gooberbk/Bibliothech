import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { syncClerkUser } from '@/lib/clerk-sync'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Settings, User, Shield, Bell } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  // Sync Clerk user with database
  await syncClerkUser(userId, {})

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    redirect('/sign-in')
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
                  <Label htmlFor="name">Nom</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.name || 'Non renseigné'}
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-1" asChild>
                    <Link href="https://accounts.clerk.com/user" target="_blank">
                      Modifier dans Clerk
                    </Link>
                  </Button>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
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
                  <Switch id="profile-visible" defaultChecked={user.profileVisible} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-visible">Activité publique</Label>
                    <p className="text-xs text-muted-foreground">
                      Afficher votre activité (favoris, téléchargements)
                    </p>
                  </div>
                  <Switch id="activity-visible" defaultChecked={user.activityVisible} />
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
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="update-notifications">Mises à jour de ressources</Label>
                    <p className="text-xs text-muted-foreground">
                      Être notifié des nouvelles ressources
                    </p>
                  </div>
                  <Switch id="update-notifications" defaultChecked />
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
