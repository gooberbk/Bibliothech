"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  Home,
  KeyRound,
  LayoutDashboard,
  Library,
  LogOut,
  BookOpen,
  Folder,
  Users,
  FileText,
} from "lucide-react"
import { logoutAdmin } from "@/actions/admin-auth-actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { name: "Gestion des Livres", href: "/admin/books", icon: BookOpen },
  { name: "Catégories", href: "/admin/categories", icon: Folder },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Admins", href: "/admin/admins", icon: KeyRound },
  { name: "Historique", href: "/admin/audit", icon: FileText },
]

function getBreadcrumbTitle(pathname: string): string {
  if (pathname === "/admin") return "Vue d'ensemble"
  if (pathname === "/admin/books") return "Gestion des Livres"
  if (pathname === "/admin/categories") return "Catégories"
  if (pathname === "/admin/users") return "Utilisateurs"
  if (pathname === "/admin/admins") return "Admins"
  if (pathname === "/admin/audit") return "Historique"
  if (pathname.startsWith("/admin/books/new")) return "Nouvelle Ressource"
  if (pathname.startsWith("/admin/books/")) return "Modifier Ressource"
  if (pathname.startsWith("/admin/categories/new")) return "Nouvelle Catégorie"
  if (pathname.startsWith("/admin/categories/")) return "Modifier Catégorie"
  if (pathname.startsWith("/admin/users/")) return "Modifier Utilisateur"
  if (pathname.startsWith("/admin/admins/")) return "Modifier Admin"
  return "Admin"
}

export function AdminShell({
  admin,
  children,
}: {
  admin: { username: string; name: string | null }
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const initials = (admin.name || admin.username).slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <Library className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">Admin</span>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 h-8 w-1 rounded-r-full bg-sidebar-primary" />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70",
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="space-y-2 border-t border-sidebar-border p-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Home className="h-4 w-4" />
              Retour au site
            </Link>
            <form action={logoutAdmin}>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex-1 pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumbTitle(pathname)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">{admin.username}</span>
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] bg-muted/30 p-8">{children}</main>
      </div>
    </div>
  )
}
