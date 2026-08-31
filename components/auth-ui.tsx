"use client"

import * as React from "react"
import { useAuth, useUser, SignInButton, SignUpButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { User, LogOut, Shield } from "lucide-react"
import Link from "next/link"

export function AuthButtons() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  if (isSignedIn === undefined) {
    return null
  }

  return (
    <>
      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">Connexion</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Inscription</Button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              {user?.firstName || 'Profile'}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
          <SignOutButton redirectUrl="/">
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </SignOutButton>
        </div>
      </SignedIn>
    </>
  )
}