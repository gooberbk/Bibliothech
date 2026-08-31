import { db } from "@/lib/db"

const [clerkId, email, ...nameParts] = process.argv.slice(2)
const name = nameParts.join(" ") || undefined

async function createAdminUser() {
  if (!clerkId || !email) {
    console.log("Usage: npx tsx scripts/create-admin-user.ts <clerkId> <email> [name]")
    console.log('Example: npx tsx scripts/create-admin-user.ts user_xxx user@example.com "Jane Doe"')
    process.exit(1)
  }

  try {
    console.log("Creating or updating admin user in database...")

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ clerkId }, { email }],
      },
    })

    const user = existingUser
      ? await db.user.update({
          where: { id: existingUser.id },
          data: {
            clerkId,
            email,
            name: name ?? existingUser.name,
            role: "ADMIN",
            profileVisible: true,
            activityVisible: true,
            lastSyncAt: new Date(),
          },
        })
      : await db.user.create({
          data: {
            clerkId,
            email,
            name,
            role: "ADMIN",
            profileVisible: true,
            activityVisible: true,
            lastSyncAt: new Date(),
          },
        })

    console.log("Admin user is ready.")
    console.log(`Clerk ID: ${user.clerkId}`)
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name || "Not set"}`)
    console.log(`Role: ${user.role}`)
    console.log("You can now access the admin dashboard at /admin.")
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

void createAdminUser()
