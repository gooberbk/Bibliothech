import { KeyRound, Plus, ShieldCheck, ShieldOff, Trash2 } from "lucide-react"
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  toggleAdminAccount,
  updateAdminPassword,
} from "@/actions/admin-account-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function AdminAccountsPage() {
  const admins = await getAdminAccounts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
        <p className="mt-1 text-muted-foreground">
          Gérer les comptes qui peuvent accéder au dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouvel admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAdminAccount} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" placeholder="Mahdi BOUKENDOUL" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nom utilisateur</Label>
              <Input id="username" name="username" placeholder="mahdi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <Button type="submit">Créer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Comptes admin ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{admin.name || admin.username}</p>
                      <p className="text-sm text-muted-foreground">@{admin.username}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.active ? "default" : "secondary"}>
                      {admin.active ? "Actif" : "Désactivé"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.lastLoginAt
                      ? new Date(admin.lastLoginAt).toLocaleString("fr-FR")
                      : "Jamais"}
                  </TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <form action={updateAdminPassword} className="flex gap-2">
                        <input type="hidden" name="id" value={admin.id} />
                        <Input
                          name="password"
                          type="password"
                          minLength={8}
                          placeholder="Nouveau mot de passe"
                          className="h-9 w-48"
                          required
                        />
                        <Button type="submit" size="sm" variant="outline">
                          Modifier
                        </Button>
                      </form>
                      <form action={toggleAdminAccount}>
                        <input type="hidden" name="id" value={admin.id} />
                        <input type="hidden" name="active" value={String(!admin.active)} />
                        <Button type="submit" size="icon" variant="outline" title={admin.active ? "Désactiver" : "Activer"}>
                          {admin.active ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        </Button>
                      </form>
                      <form action={deleteAdminAccount}>
                        <input type="hidden" name="id" value={admin.id} />
                        <Button type="submit" size="icon" variant="outline" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
