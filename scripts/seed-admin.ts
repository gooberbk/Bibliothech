import { db } from '@/lib/db'
import { hashAdminPassword } from '@/lib/admin-password'

async function seedAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME

  if (!adminUsername || !adminPassword) {
    console.log('Usage: ADMIN_USERNAME=admin ADMIN_PASSWORD="change-me-strong" ADMIN_NAME="Jane Doe" npx tsx scripts/seed-admin.ts')
    process.exit(1)
  }

  try {
    const username = adminUsername.trim().toLowerCase()
    const existingAdmin = await db.adminAccount.findUnique({
      where: { username },
    })

    if (existingAdmin) {
      await db.adminAccount.update({
        where: { id: existingAdmin.id },
        data: {
          name: adminName ?? existingAdmin.name,
          passwordHash: hashAdminPassword(adminPassword),
          active: true,
        },
      })
      console.log('✅ Admin account updated')
      return
    }

    const admin = await db.adminAccount.create({
      data: {
        username,
        name: adminName,
        passwordHash: hashAdminPassword(adminPassword),
      },
    })

    console.log('✅ Admin account created successfully')
    console.log(`👤 Username: ${admin.username}`)
  } catch (error) {
    console.error('❌ Error seeding admin account:', error)
  } finally {
    await db.$disconnect()
  }
}

void seedAdmin()
