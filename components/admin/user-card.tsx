"use client"

import * as React from "react"
import Link from "next/link"
import {
  Shield,
  Download,
  Heart,
  Activity,
  MoreHorizontal,
  Pencil,
  Mail,
  Calendar,
  User,
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
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string | null
  email: string | null
  role: "USER" | "ADMIN"
  createdAt: Date
  _count: {
    downloads: number
    favorites: number
    activities: number
  }
}

interface UserCardProps {
  user: User
  onEdit: (user: User) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const initials = (user.name || user.email || "U").slice(0, 2).toUpperCase()
  const isAdmin = user.role === "ADMIN"

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"}>
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{user.name || "Utilisateur sans nom"}</h3>
              <Badge
                variant={isAdmin ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {isAdmin ? (
                  <>
                    <Shield className="h-3 w-3" />
                    Admin
                  </>
                ) : (
                  "Utilisateur"
                )}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user.email || "Pas d'email"}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t">
              <div className="flex items-center gap-1 text-xs">
                <Download className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{user._count.downloads}</span>
                <span className="text-muted-foreground">dl</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{user._count.favorites}</span>
                <span className="text-muted-foreground">fav</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{user._count.activities}</span>
                <span className="text-muted-foreground">actions</span>
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
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier le rôle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${user.id}/edit`}>
                  <User className="mr-2 h-4 w-4" />
                  Voir le profil
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}