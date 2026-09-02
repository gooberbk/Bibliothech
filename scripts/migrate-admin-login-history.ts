import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating AdminLoginHistory table...')
  
  // Check if table already exists
  const tableExists = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'AdminLoginHistory'
    )
  ` as { exists: boolean }[]

  if (tableExists[0].exists) {
    console.log('AdminLoginHistory table already exists')
    return
  }

  // Create the table manually using raw SQL for precision
  await prisma.$executeRaw`
    CREATE TABLE "AdminLoginHistory" (
      "id" TEXT NOT NULL,
      "adminId" TEXT NOT NULL,
      "adminUsername" TEXT NOT NULL,
      "ipAddress" TEXT NOT NULL,
      "userAgent" TEXT NOT NULL,
      "success" BOOLEAN NOT NULL,
      "failureReason" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "AdminLoginHistory_pkey" PRIMARY KEY ("id")
    )
  `

  // Add foreign key constraint
  await prisma.$executeRaw`
    ALTER TABLE "AdminLoginHistory" 
    ADD CONSTRAINT "AdminLoginHistory_adminId_fkey" 
    FOREIGN KEY ("adminId") REFERENCES "AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
  `

  // Add indexes
  await prisma.$executeRaw`
    CREATE INDEX "AdminLoginHistory_adminId_idx" ON "AdminLoginHistory"("adminId")
  `

  await prisma.$executeRaw`
    CREATE INDEX "AdminLoginHistory_createdAt_idx" ON "AdminLoginHistory"("createdAt")
  `

  await prisma.$executeRaw`
    CREATE INDEX "AdminLoginHistory_success_idx" ON "AdminLoginHistory"("success")
  `

  console.log('AdminLoginHistory table created successfully')
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })