/**
 * Migration script to transition users from neonId to clerkId
 * This script should be run after Clerk is set up and users have been synced
 * 
 * Usage: npx tsx scripts/migrate-users-to-clerk.ts
 */

import { db } from '../lib/db'

async function migrateUsers() {
  console.log('Starting user migration from neonId to clerkId...')

  try {
    // Get all users with neonId but no clerkId
    const usersToMigrate = await db.user.findMany({
      where: {
        neonId: { not: null },
        clerkId: null,
      },
    })

    console.log(`Found ${usersToMigrate.length} users to migrate`)

    if (usersToMigrate.length === 0) {
      console.log('No users to migrate. Exiting.')
      return
    }

    // For now, we'll keep neonId as the identifier until users sign in with Clerk
    // When users sign in with Clerk, the webhook or sync function will update their clerkId
    console.log('Users will be migrated automatically when they sign in with Clerk.')
    console.log('This script is informational - actual migration happens during sign-in.')

    // Optional: You could implement a bulk migration here if you have a way to map neonId to clerkId
    // For now, we'll keep both fields for the transition period

  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

migrateUsers()
  .then(() => {
    console.log('Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })
