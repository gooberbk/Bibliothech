'use client'
import { useAuth, useUser } from '@clerk/nextjs'

export function useClerkAuth() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()

  return {
    isLoaded,
    isSignedIn,
    userId,
    user,
  }
}
