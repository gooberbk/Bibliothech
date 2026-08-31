import { LockKeyhole } from "lucide-react"
import { loginAdmin } from "@/actions/admin-auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
            <LockKeyhole className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Connexion admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={loginAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom utilisateur</Label>
              <Input id="username" name="username" autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">
                {error === "missing"
                  ? "Nom utilisateur et mot de passe requis."
                  : "Identifiants admin invalides."}
              </p>
            )}
            <Button type="submit" className="w-full">
              Entrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
