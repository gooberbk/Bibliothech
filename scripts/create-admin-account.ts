import { db } from "@/lib/db"
import { hashAdminPassword } from "@/lib/admin-password"

const [rawUsername, password, ...nameParts] = process.argv.slice(2)
const username = rawUsername?.trim().toLowerCase()
const name = nameParts.join(" ") || undefined

async function createAdminAccount() {
  if (!username || !password) {
    console.log('Usage: npx tsx scripts/create-admin-account.ts <username> <password> [name]')
    console.log('Example: npx tsx scripts/create-admin-account.ts mahdi "change-me-strong" "Mahdi BOUKENDOUL"')
    process.exit(1)
  }

  if (!/^[a-z0-9._-]{3,40}$/i.test(username)) {
    console.log("Username must be 3-40 chars and use letters, numbers, dots, hyphens, or underscores.")
    process.exit(1)
  }

  if (password.length < 8) {
    console.log("Password must contain at least 8 characters.")
    process.exit(1)
  }

  try {
    const existingAdmin = await db.adminAccount.findUnique({
      where: { username },
    })

    const admin = existingAdmin
      ? await db.adminAccount.update({
          where: { id: existingAdmin.id },
          data: {
            name: name ?? existingAdmin.name,
            passwordHash: hashAdminPassword(password),
            active: true,
          },
        })
      : await db.adminAccount.create({
          data: {
            username,
            name,
            passwordHash: hashAdminPassword(password),
          },
        })

    console.log("Admin account is ready.")
    console.log(`Username: ${admin.username}`)
    console.log(`Name: ${admin.name || "Not set"}`)
    console.log(`Active: ${admin.active}`)
  } catch (error) {
    console.error("Error creating admin account:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

void createAdminAccount()
