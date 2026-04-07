const { db } = require("../lib/db")

async function main() {
  const email = `neon-test-${Date.now()}@example.com`

  const created = await db.user.create({
    data: {
      email,
      name: "Neon Test User",
    },
  })

  const readBack = await db.user.findUnique({
    where: { id: created.id },
  })

  await db.user.delete({
    where: { id: created.id },
  })

  console.log(
    JSON.stringify(
      {
        ok: true,
        createdId: created.id,
        readBackEmail: readBack ? readBack.email : null,
      },
      null,
      2
    )
  )
}

main()
  .catch((error) => {
    console.error("DB_TEST_ERROR", error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
