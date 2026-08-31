import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { awardNewMemberBadge } from '@/lib/badges/awarding'

/**
 * Sync Clerk user with database
 * This function creates or updates a user record when they sign in with Clerk
 */
export async function syncClerkUser(clerkId: string, userData: {
  email?: string
  name?: string
  image?: string
}) {
  try {
    // Check if user already exists by clerkId
    let user = await db.user.findUnique({
      where: { clerkId },
    })

    if (user) {
      // Update existing user
      user = await db.user.update({
        where: { clerkId },
        data: {
          email: userData.email || user.email,
          name: userData.name || user.name,
          image: userData.image || user.image,
          lastSyncAt: new Date(),
        },
      })
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          clerkId,
          email: userData.email,
          name: userData.name,
          image: userData.image,
          role: 'USER',
          lastSyncAt: new Date(),
        },
      })

      // Award new member badge
      await awardNewMemberBadge(user.id)
    }

    return user
  } catch (error) {
    console.error('Error syncing Clerk user:', error)
    throw error
  }
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  return db.user.findUnique({
    where: { clerkId },
  })
}

/**
 * Migrate user from neonId to clerkId
 * This is a helper for the transition period
 */
export async function migrateUserFromNeon(neonId: string, clerkId: string) {
  try {
    const user = await db.user.findUnique({
      where: { neonId },
    })

    if (user) {
      // Update the user with clerkId
      return await db.user.update({
        where: { id: user.id },
        data: {
          clerkId,
          lastSyncAt: new Date(),
        },
      })
    }

    return null
  } catch (error) {
    console.error('Error migrating user from neonId:', error)
    throw error
  }
}
