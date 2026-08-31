import { auth } from '@clerk/nextjs/server'

export async function getCurrentUser() {
  const { userId } = await auth()
  return userId
}

export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

export async function getCurrentUserDetails() {
  const { userId, sessionClaims } = await auth()
  return {
    userId,
    sessionClaims,
  }
}
