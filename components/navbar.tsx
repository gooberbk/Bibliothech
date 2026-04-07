"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Library,
  Search,
  X,
  Sun,
  Moon,
  Menu,
  Bookmark,
  History,
  ShieldCheck,
  LogOut,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock auth state - in production, use NextAuth
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [user, setUser] = React.useState<{
    name: string
    email: string
    role: "USER" | "ADMIN"
    avatar?: string
  } | null>(null)

  const login = () => {
    setIsAuthenticated(true)
    setUser({
      name: "Ahmed Benali",
      email: "a.benali@estin.dz",
      role: "ADMIN",
      avatar: undefined,
    })
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return { isAuthenticated, user, login, logout }
}

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [searchValue, setSearchValue] = React.useState("")
  const [mounted, setMounted] = React.useState(false)
  const { isAuthenticated, user, login, logout } = useAuth()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const clearSearch = () => setSearchValue("")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Library className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Biblio ESTIN</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Chercher un TD, un livre, un cours..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-[400px] pl-9 pr-9"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:flex"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {!isAuthenticated ? (
              <>
                <Button variant="outline" onClick={login}>
                  Connexion
                </Button>
                <Button>Inscription</Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      Mes Favoris
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Historique
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          Tableau de Bord Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5 text-primary" />
                  Biblio ESTIN
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Chercher..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full pl-9"
                  />
                </div>

                {/* Mobile Theme Toggle */}
                {mounted && (
                  <Button
                    variant="outline"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full justify-start gap-2"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                    {theme === "dark" ? "Mode clair" : "Mode sombre"}
                  </Button>
                )}

                {/* Mobile Auth */}
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={login} className="w-full">
                      Connexion
                    </Button>
                    <Button className="w-full">Inscription</Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/favorites">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Mes Favoris
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/history">
                        <History className="mr-2 h-4 w-4" />
                        Historique
                      </Link>
                    </Button>
                    {user?.role === "ADMIN" && (
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/admin">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Admin
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className="justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
