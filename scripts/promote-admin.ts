import { db } from '@/lib/db'

async function promoteToAdmin() {
  // Get clerkId from command line argument
  const clerkId = process.argv[2]

  if (!clerkId) {
    console.log('❌ Usage: npx tsx scripts/promote-admin.ts <clerkId>')
    console.log('📝 Example: npx tsx scripts/promote-admin.ts user_3Icx_y301uVnLa')
    process.exit(1)
  }

  try {
    console.log(`🔍 Looking for user with clerkId: ${clerkId}`)

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      console.log('❌ User not found in database')
      console.log('💡 The user will be created on their first login')
      console.log('💡 Please log in to the app first, then run this script again')
      process.exit(1)
    }

    console.log(`👤 Found user: ${user.name || 'No name'} (${user.email})`)
    console.log(`🔧 Current role: ${user.role}`)

    if (user.role === 'ADMIN') {
      console.log('✅ User is already an ADMIN')
      process.exit(0)
    }

    // Update role to ADMIN
    await db.user.update({
      where: { clerkId },
      data: { role: 'ADMIN' }
    })

    console.log('✅ User promoted to ADMIN successfully!')
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Name: ${user.name || 'Not set'}`)
    console.log(`🎉 You can now access the admin dashboard at /admin`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

promoteToAdmin()
