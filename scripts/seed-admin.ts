import { db } from '@/lib/db'

async function seedAdmin() {
  const adminClerkId = process.env.ADMIN_CLERK_ID
  const adminEmail = process.env.ADMIN_EMAIL
  const adminName = process.env.ADMIN_NAME

  if (!adminClerkId || !adminEmail) {
    console.log('Usage: ADMIN_CLERK_ID=user_xxx ADMIN_EMAIL=user@example.com ADMIN_NAME="Jane Doe" npx tsx scripts/seed-admin.ts')
    process.exit(1)
  }

  try {
    const existingAdmin = await db.user.findFirst({
      where: {
        OR: [{ clerkId: adminClerkId }, { email: adminEmail }],
      },
    })

    if (existingAdmin) {
      if (existingAdmin.role === 'ADMIN') {
        console.log('✅ Admin user already exists and is ADMIN')
        return
      }
      await db.user.update({
        where: { id: existingAdmin.id },
        data: {
          clerkId: adminClerkId,
          email: adminEmail,
          name: adminName ?? existingAdmin.name,
          role: 'ADMIN',
          profileVisible: true,
          activityVisible: true,
          lastSyncAt: new Date(),
        },
      })
      console.log('✅ User updated to ADMIN')
      return
    }

    const admin = await db.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        clerkId: adminClerkId,
        role: 'ADMIN',
        profileVisible: true,
        activityVisible: true,
        lastSyncAt: new Date(),
      },
    })

    console.log('✅ Admin user created successfully')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Name: ${admin.name}`)
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
  } finally {
    await db.$disconnect()
  }
}

seedAdmin()
