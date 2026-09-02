"use client"

import * as React from "react"
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Key,
  Clock,
  MoreHorizontal,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

type Admin = {
  id: string
  username: string
  name: string | null
  active: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

interface AdminCardProps {
  admin: Admin
  onToggleStatus: (admin: Admin) => void
  onChangePassword: (admin: Admin) => void
  onDelete: (admin: Admin) => void
  onViewHistory: (admin: Admin) => void
  isSelf: boolean
  isActiveAdminCount: number
}

export function AdminCard({
  admin,
  onToggleStatus,
  onChangePassword,
  onDelete,
  onViewHistory,
  isSelf,
  isActiveAdminCount,
}: AdminCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)

  const initials = (admin.name || admin.username).slice(0, 2).toUpperCase()
  const isActive = admin.active
  const isLastActiveAdmin = isActive && isActiveAdminCount <= 1

  const formatDate = (date: Date | null) => {
    if (!date) return "Jamais"
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStatusToggle = () => {
    if (isSelf) {
      // Cannot deactivate self
      return
    }
    if (isLastActiveAdmin) {
      setStatusDialogOpen(true)
      return
    }
    onToggleStatus(admin)
  }

  const handleDelete = () => {
    if (isSelf) {
      // Cannot delete self
      return
    }
    if (isActive && isLastActiveAdmin) {
      setStatusDialogOpen(true)
      return
    }
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <Card className={cn(
        "group hover:border-primary/50 transition-colors",
        !isActive && "opacity-60"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={isActive ? "bg-primary text-primary-foreground" : "bg-muted"}>
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{admin.name || admin.username}</h3>
                {isSelf && (
                  <Badge variant="outline" className="text-xs">
                    Vous
                  </Badge>
                )}
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {isActive ? (
                    <>
                      <ShieldCheck className="h-3 w-3" />
                      Actif
                    </>
                  ) : (
                    <>
                      <ShieldOff className="h-3 w-3" />
                      Désactivé
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="font-mono">@{admin.username}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Dernière connexion: {formatDate(admin.lastLoginAt)}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewHistory(admin)}>
                  <Clock className="mr-2 h-4 w-4" />
                  Historique de connexion
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onChangePassword(admin)}
                  disabled={isSelf}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Changer le mot de passe
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleStatusToggle}
                  disabled={isSelf || isLastActiveAdmin}
                >
                  {isActive ? (
                    <>
                      <ShieldOff className="mr-2 h-4 w-4" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Activer
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isSelf || (isActive && isLastActiveAdmin)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Warning Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Action impossible</AlertDialogTitle>
            <AlertDialogDescription>
              {isLastActiveAdmin
                ? "Impossible de désactiver ou supprimer le dernier administrateur actif. Il doit toujours y avoir au moins un admin actif."
                : "Impossible de modifier votre propre compte. Demandez à un autre administrateur de le faire."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Compris</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce compte admin ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le compte admin &ldquo;{admin.username}
              &rdquo; ? Cette action est irréversible et toutes les sessions seront invalidées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(admin)
                setDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}