"use server"

import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"
import { adminActionRateLimit } from "@/lib/rate-limit"

const ensureAdmin = async () => {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }
  
  return admin
}

export async function getAuditLogs(options?: {
  page?: number
  limit?: number
  filters?: {
    action?: string
    entityType?: string
    adminId?: string
    startDate?: Date
    endDate?: Date
  }
}) {
  const admin = await ensureAdmin()
  
  const page = options?.page || 1
  const limit = options?.limit || 20
  const filters = options?.filters

  const where: any = {}

  if (filters?.action) {
    where.action = filters.action
  }

  if (filters?.entityType) {
    where.entityType = filters.entityType
  }

  if (filters?.adminId) {
    where.adminId = filters.adminId
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {}
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate
    }
  }

  const [logs, total] = await Promise.all([
    db.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        adminId: true,
        adminUsername: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    }),
    db.adminAuditLog.count({ where }),
  ])

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getAuditActions() {
  const admin = await ensureAdmin()
  
  const actions = await db.adminAuditLog.findMany({
    select: { action: true },
    distinct: ["action"],
    orderBy: { action: "asc" },
  })

  return actions.map(a => a.action)
}

export async function getAuditEntityTypes() {
  const admin = await ensureAdmin()
  
  const entityTypes = await db.adminAuditLog.findMany({
    where: { entityType: { not: null } },
    select: { entityType: true },
    distinct: ["entityType"],
    orderBy: { entityType: "asc" },
  })

  return entityTypes.map(e => e.entityType).filter(Boolean)
}

export async function getAuditAdmins() {
  const admin = await ensureAdmin()
  
  const admins = await db.adminAuditLog.findMany({
    select: { adminId: true, adminUsername: true },
    distinct: ["adminId"],
    orderBy: { adminUsername: "asc" },
  })

  return admins.map(a => a.adminUsername)
}