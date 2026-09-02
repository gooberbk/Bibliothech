import { headers } from "next/headers"
import { db } from "@/lib/db"

type AuditAction = 
  | "LOGIN"
  | "LOGOUT"
  | "CREATE_RESOURCE"
  | "DELETE_RESOURCE"
  | "UPDATE_RESOURCE"
  | "CREATE_CATEGORY"
  | "DELETE_CATEGORY"
  | "UPDATE_CATEGORY"
  | "UPDATE_USER_ROLE"
  | "CREATE_ADMIN"
  | "DELETE_ADMIN"
  | "UPDATE_ADMIN_PASSWORD"
  | "TOGGLE_ADMIN_STATUS"
  | "FAILED_LOGIN"

type AuditLogData = {
  adminId: string
  adminUsername: string
  action: AuditAction
  entityType?: string
  entityId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logAdminAction(data: AuditLogData) {
  try {
    const headersList = await headers()
    const ipAddress = data.ipAddress || 
      headersList.get("x-forwarded-for") || 
      headersList.get("x-real-ip") || 
      "unknown"
    
    const userAgent = data.userAgent || headersList.get("user-agent") || "unknown"

    await db.adminAuditLog.create({
      data: {
        adminId: data.adminId,
        adminUsername: data.adminUsername,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    // Don't throw errors for audit logging to avoid breaking main flows
    console.error("Failed to log admin action:", error)
  }
}

export async function logAdminLogin(adminId: string, adminUsername: string, success: boolean) {
  await logAdminAction({
    adminId,
    adminUsername,
    action: success ? "LOGIN" : "FAILED_LOGIN",
    metadata: { success },
  })
}

export async function logAdminLogout(adminId: string, adminUsername: string) {
  await logAdminAction({
    adminId,
    adminUsername,
    action: "LOGOUT",
  })
}

export async function logResourceAction(
  adminId: string,
  adminUsername: string,
  action: "CREATE_RESOURCE" | "DELETE_RESOURCE" | "UPDATE_RESOURCE",
  resourceId: string,
  resourceTitle: string
) {
  await logAdminAction({
    adminId,
    adminUsername,
    action,
    entityType: "Resource",
    entityId: resourceId,
    metadata: { resourceTitle },
  })
}

export async function logCategoryAction(
  adminId: string,
  adminUsername: string,
  action: "CREATE_CATEGORY" | "DELETE_CATEGORY" | "UPDATE_CATEGORY",
  categoryId: string,
  categoryName: string
) {
  await logAdminAction({
    adminId,
    adminUsername,
    action,
    entityType: "Category",
    entityId: categoryId,
    metadata: { categoryName },
  })
}

export async function logUserAction(
  adminId: string,
  adminUsername: string,
  action: "UPDATE_USER_ROLE",
  userId: string,
  userEmail: string,
  newRole: string
) {
  await logAdminAction({
    adminId,
    adminUsername,
    action,
    entityType: "User",
    entityId: userId,
    metadata: { userEmail, newRole },
  })
}

export async function logAdminAccountAction(
  adminId: string,
  adminUsername: string,
  action: "CREATE_ADMIN" | "DELETE_ADMIN" | "UPDATE_ADMIN_PASSWORD" | "TOGGLE_ADMIN_STATUS",
  targetAdminId: string,
  targetAdminUsername: string,
  metadata?: Record<string, any>
) {
  await logAdminAction({
    adminId,
    adminUsername,
    action,
    entityType: "AdminAccount",
    entityId: targetAdminId,
    metadata: { targetAdminUsername, ...metadata },
  })
}