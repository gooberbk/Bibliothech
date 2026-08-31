"use client"

import * as React from "react"
import { authClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import Link from "next/link"

export function AuthButtons() {
  const [isSignedIn, setIsSignedIn] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession()
        setIsSignedIn(!!data?.user)
      } catch (error) {
        console.error("Error checking session:", error)
        setIsSignedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return null
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">Admin</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href="/sign-in">Connexion</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/sign-up">Inscription</Link>
      </Button>
    </div>
  )
}