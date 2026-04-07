import { PrismaClient } from "@prisma/client"

const NEON_DATABASE_URL =
  "postgresql://neondb_owner:npg_bh0LpRD6KZki@ep-lucky-recipe-ag9fkb4j-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

process.env.DATABASE_URL ||= NEON_DATABASE_URL
process.env.DIRECT_URL ||= NEON_DATABASE_URL

const connectionString = process.env.DATABASE_URL || NEON_DATABASE_URL

declare global {
  var prisma: PrismaClient | undefined
}

export const db =
  globalThis.prisma ??
  new PrismaClient({
    datasourceUrl: connectionString,
  })

if (process.env.NODE_ENV !== "production") globalThis.prisma = db