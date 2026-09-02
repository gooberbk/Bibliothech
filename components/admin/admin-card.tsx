"use client"

import * as React from "react"
import { MoreHorizontal, Edit, Shield, ShieldAlert, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Admin {
  id: string
  username: string
  name: string | null
  active: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

interface AdminCardProps {
  admin: Admin
  onEdit: (admin: Admin) => void
  onToggleStatus: (admin: Admin) => void
  onDelete: (admin: Admin) => void
  onViewHistory?: (admin: Admin) => void
}

export function AdminCard({ admin, onEdit, onToggleStatus, onDelete, onViewHistory }: AdminCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {admin.username}
              <Badge variant={admin.active ? "default" : "secondary"} className="text-xs">
                {admin.active ? "Actif" : "Inactif"}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {admin.name || "Pas de nom"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(admin)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(admin)}>
                {admin.active ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Activer
                  </>
                )}
              </DropdownMenuItem>
              {onViewHistory && (
                <DropdownMenuItem onClick={() => onViewHistory(admin)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Historique
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(admin)}
                className="text-destructive"
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Dernière connexion</span>
            <span>
              {admin.lastLoginAt 
                ? new Date(admin.lastLoginAt).toLocaleDateString('fr-FR')
                : "Jamais"
              }
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Créé le</span>
            <span>{new Date(admin.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}