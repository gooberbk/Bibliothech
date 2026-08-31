import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { syncClerkUser } from '@/lib/clerk-sync'
import { getUserActivities } from '@/lib/activity/tracker'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
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

  const activities = await getUserActivities(user.id, 50)

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      download: 'Téléchargement',
      favorite: 'Ajout aux favoris',
      unfavorite: 'Retrait des favoris',
      role_change: 'Changement de rôle',
      profile_view: 'Vue de profil',
      login: 'Connexion',
    }
    return labels[action] || action
  }

  const getActionBadgeVariant = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      download: 'default',
      favorite: 'secondary',
      unfavorite: 'outline',
      role_change: 'default',
      profile_view: 'outline',
      login: 'secondary',
    }
    return variants[action] || 'outline'
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au profil
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Historique d'activité</h1>
            <p className="mt-1 text-muted-foreground">
              Vos 50 dernières activités sur la plateforme
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activités récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune activité enregistrée pour le moment
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getActionBadgeVariant(activity.action)}>
                            {getActionLabel(activity.action)}
                          </Badge>
                          {activity.entityType && (
                            <span className="text-xs text-muted-foreground">
                              {activity.entityType}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activity.entityId && `ID: ${activity.entityId}`}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(activity.createdAt).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
