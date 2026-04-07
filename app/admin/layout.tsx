"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Library,
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ChevronRight,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const navigation = [
  { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { name: "Gestion des Livres", href: "/admin/books", icon: BookOpen },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Paramètres", href: "/admin/settings", icon: Settings },
]

function getBreadcrumbTitle(pathname: string): string {
  if (pathname === "/admin") return "Vue d'ensemble"
  if (pathname === "/admin/books") return "Gestion des Livres"
  if (pathname === "/admin/users") return "Utilisateurs"
  if (pathname === "/admin/settings") return "Paramètres"
  if (pathname.startsWith("/admin/books/new")) return "Nouvelle Ressource"
  return "Admin"
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <Library className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">
              Admin
            </span>
          </div>

          {/* Navigation */}
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
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Return to site */}
          <div className="border-t border-sidebar-border p-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Home className="h-4 w-4" />
              Retour au site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 pl-64">
        {/* Top Header */}
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

          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt="Admin" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] bg-muted/30 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
