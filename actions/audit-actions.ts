"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"
import { adminActionRateLimit } from "@/lib/rate-limit"

const AuditFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  action: z.string().optional(),
  entityType: z.string().optional(),
  adminId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type AuditFilters = z.infer<typeof AuditFiltersSchema>

type AuditLog = {
  id: string
  adminId: string
  adminUsername: string
  action: string
  entityType: string | null
  entityId: string | null
  metadata: string | null
  ipAddress: string
  userAgent: string
  createdAt: Date
}

type PaginatedAuditLogs = {
  logs: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getAuditLogs(filters?: AuditFilters): Promise<PaginatedAuditLogs> {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const validatedFilters = AuditFiltersSchema.parse(filters)
  const { page, limit, action, entityType, adminId, startDate, endDate } = validatedFilters

  const where: any = {}

  if (action) {
    where.action = action
  }

  if (entityType) {
    where.entityType = entityType
  }

  if (adminId) {
    where.adminId = adminId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = new Date(startDate)
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate)
    }
  }

  const [logs, total] = await Promise.all([
    db.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
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

export async function getAuditLogById(id: string) {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const log = await db.adminAuditLog.findUnique({
    where: { id },
  })

  if (!log) {
    throw new Error("Log d'audit introuvable")
  }

  return log
}

export async function getAuditActions() {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const actions = await db.adminAuditLog.findMany({
    select: {
      action: true,
    },
    distinct: ["action"],
    orderBy: { action: "asc" },
  })

  return actions.map(a => a.action)
}

export async function getAuditEntityTypes() {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const entityTypes = await db.adminAuditLog.findMany({
    where: {
      entityType: {
        not: null,
      },
    },
    select: {
      entityType: true,
    },
    distinct: ["entityType"],
    orderBy: { entityType: "asc" },
  })

  return entityTypes.map(e => e.entityType).filter(Boolean)
}

export async function getAuditAdmins() {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const admins = await db.adminAuditLog.findMany({
    select: {
      adminId: true,
      adminUsername: true,
    },
    distinct: ["adminId"],
    orderBy: { adminUsername: "asc" },
  })

  return admins
}