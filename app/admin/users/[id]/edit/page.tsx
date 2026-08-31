import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { syncClerkUser } from "@/lib/clerk-sync"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, User } from "lucide-react"
import Link from "next/link"
import { updateUserRole } from "@/actions/user-actions"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // Sync Clerk user with database
  await syncClerkUser(userId, {})

  const currentUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/")
  }

  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect("/admin/users")
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations de l'utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Rôle actuel</h3>
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

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Changer le rôle</h3>
            <form action={updateUserRole} className="flex gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="currentRole" value={user.role} />
              
              <Button
                type="submit"
                name="newRole"
                value="ADMIN"
                variant={user.role === "ADMIN" ? "default" : "outline"}
                disabled={user.role === "ADMIN"}
              >
                <Shield className="mr-2 h-4 w-4" />
                Promouvoir Admin
              </Button>
              
              <Button
                type="submit"
                name="newRole"
                value="USER"
                variant={user.role === "USER" ? "default" : "outline"}
                disabled={user.role === "USER"}
              >
                <User className="mr-2 h-4 w-4" />
                Rétrograder Utilisateur
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}