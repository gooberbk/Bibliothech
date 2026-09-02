import { db } from "@/lib/db"

async function migrateAdminAudit() {
  console.log("🔄 Creating AdminAuditLog table...")
  
  try {
    // Check if table already exists
    const existingTable = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'AdminAuditLog'
      )
    `
    
    if (existingTable[0].exists) {
      console.log("✅ AdminAuditLog table already exists")
      return
    }

    // Create the table manually if Prisma migration hasn't been run
    await db.$executeRaw`
      CREATE TABLE "AdminAuditLog" (
        "id" TEXT NOT NULL,
        "adminId" TEXT NOT NULL,
        "adminUsername" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "entityType" TEXT,
        "entityId" TEXT,
        "metadata" TEXT,
        "ipAddress" TEXT NOT NULL,
        "userAgent" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
      );
    `

    // Create indexes
    await db.$executeRaw`
      CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");
    `
    
    await db.$executeRaw`
      CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
    `
    
    await db.$executeRaw`
      CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
    `
    
    await db.$executeRaw`
      CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");
    `

    // Add foreign key constraint
    await db.$executeRaw`
      ALTER TABLE "AdminAuditLog" 
      ADD CONSTRAINT "AdminAuditLog_adminId_fkey" 
      FOREIGN KEY ("adminId") REFERENCES "AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    console.log("✅ AdminAuditLog table created successfully")
  } catch (error) {
    console.error("❌ Error creating AdminAuditLog table:", error)
    throw error
  }
}

async function main() {
  try {
    await migrateAdminAudit()
    console.log("\n🎉 Admin audit migration completed successfully!")
    console.log("\n📝 Next steps:")
    console.log("1. Run: npx prisma migrate dev --name add-admin-audit")
    console.log("2. Run: npx prisma generate")
    console.log("3. Restart your development server")
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
import { db } from "@/lib/db"

async function migrateAdminAudit() {
  console.log("🔄 Creating AdminAuditLog table...")
  
  try {
    // Check if table already exists
    const existingTable = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'AdminAuditLog'
      )
    `
    
    if (existingTable[0].exists) {
      console.log("✅ AdminAuditLog table already exists")
      return
    }

    // Create the table manually if Prisma migration hasn't been run
    await db.$executeRaw`
      CREATE TABLE "AdminAuditLog" (
        "id" TEXT NOT NULL,
        "adminId" TEXT NOT NULL,
        "adminUsername" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "entityType" TEXT,
        "entityId" TEXT,
        "metadata" TEXT,
        "ipAddress" TEXT NOT NULL,
        "userAgent" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
      );
    `

    // Create indexes
    await db.$executeRaw`
      CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");
    `
    
    await db.$executeRaw`
      CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
    `
    
    await db.$executeRaw`
      CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
    `
    
    await db.$executeRaw`
      CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");
    `

    // Add foreign key constraint
    await db.$executeRaw`
      ALTER TABLE "AdminAuditLog" 
      ADD CONSTRAINT "AdminAuditLog_adminId_fkey" 
      FOREIGN KEY ("adminId") REFERENCES "AdminAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    console.log("✅ AdminAuditLog table created successfully")
  } catch (error) {
    console.error("❌ Error creating AdminAuditLog table:", error)
    throw error
  }
}

async function main() {
  try {
    await migrateAdminAudit()
    console.log("\n🎉 Admin audit migration completed successfully!")
    console.log("\n📝 Next steps:")
    console.log("1. Run: npx prisma migrate dev --name add-admin-audit")
    console.log("2. Run: npx prisma generate")
    console.log("3. Restart your development server")
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()