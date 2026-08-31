import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { syncClerkUser } from '@/lib/clerk-sync'
import { getUserBadges } from '@/lib/badges/awarding'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Download, Heart, Settings, Activity, Award } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  // Sync Clerk user with database
  await syncClerkUser(userId, {})

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      favorites: {
        include: {
          resource: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
      downloads: {
        include: {
          resource: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
    },
  })

  if (!user) {
    redirect('/sign-in')
  }

  const badges = await getUserBadges(user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {user.name || 'Mon Profil'}
                </h1>
                <p className="mt-1 text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/profile/edit">
                    Modifier le profil
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Nom</p>
                  <p className="text-sm text-muted-foreground">
                    {user.name || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Bio</p>
                  <p className="text-sm text-muted-foreground">
                    {user.bio || 'Non renseignée'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Rôle</p>
                  <UIBadge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                  </UIBadge>
                </div>
                <div>
                  <p className="text-sm font-medium">Membre depuis</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/profile/activity">
                      <Activity className="mr-2 h-4 w-4" />
                      Voir l'activité
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges ({badges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-4">
                    <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aucun badge obtenu pour le moment
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Continuez à utiliser la plateforme pour en débloquer !
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorites Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Favoris ({user.favorites.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.favorites.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun favori pour le moment
                  </p>
                ) : (
                  <div className="space-y-2">
                    {user.favorites.map((favorite) => (
                      <Link
                        key={favorite.id}
                        href={`/book/${favorite.resource.id}`}
                        className="block text-sm hover:underline"
                      >
                        {favorite.resource.title}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Downloads Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Téléchargements récents ({user.downloads.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.downloads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun téléchargement pour le moment
                  </p>
                ) : (
                  <div className="space-y-2">
                    {user.downloads.map((download) => (
                      <Link
                        key={download.id}
                        href={`/book/${download.resource.id}`}
                        className="block text-sm hover:underline"
                      >
                        {download.resource.title}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
