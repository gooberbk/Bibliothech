"use client"

import * as React from "react"
import { MoreHorizontal, Edit, Shield, ShieldAlert, Mail, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string | null
  email: string | null
  role: "USER" | "ADMIN"
  createdAt: Date
  _count?: {
    downloads: number
    favorites: number
  }
}

interface UserCardProps {
  user: User
  onEdit: (user: User) => void
  onToggleRole: (user: User) => void
}

export function UserCard({ user, onEdit, onToggleRole }: UserCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">
              {user.name || "Utilisateur sans nom"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email || "Pas d'email"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleRole(user)}>
                {user.role === "USER" ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Promouvoir admin
                  </>
                ) : (
                  <>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Rétrograder utilisateur
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
              {user.role === "ADMIN" ? "Admin" : "Utilisateur"}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          {user._count && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{user._count.downloads} téléchargements</span>
              </div>
              <div className="flex items-center gap-1">
                <span>♥ {user._count.favorites} favoris</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}