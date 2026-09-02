import { LockKeyhole, AlertCircle } from "lucide-react"
import { loginAdmin } from "@/actions/admin-auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const errorMessages: Record<string, { title: string; message: string }> = {
  missing: {
    title: "Champs manquants",
    message: "Nom utilisateur et mot de passe requis.",
  },
  invalid: {
    title: "Identifiants invalides",
    message: "Nom utilisateur ou mot de passe incorrect.",
  },
  ratelimit: {
    title: "Trop de tentatives",
    message: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  },
}

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
              <Input 
                id="username" 
                name="username" 
                autoComplete="username" 
                required 
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </div>
            {error && errorMessages[error] && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{errorMessages[error].title}:</strong> {errorMessages[error].message}
                </AlertDescription>
              </Alert>
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
