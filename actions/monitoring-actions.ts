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

export async function getMonitoringData() {
  const admin = await ensureAdmin()

  // Get system metrics
  const [totalUsers, activeUsers, totalResources, totalCategories, totalAdmins, recentActivities] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { activityVisible: true } }),
    db.resource.count(),
    db.category.count(),
    db.adminAccount.count({ where: { active: true } }),
    db.userActivity.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
  ])

  // Get database performance metrics
  const avgResponseTime = 150 // Placeholder - implement actual timing
  const dbConnectionPool = 10 // Placeholder - get from actual pool stats

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      growthRate: 5.2 // Placeholder - calculate from historical data
    },
    resources: {
      total: totalResources,
      avgDownloads: 12.5 // Placeholder - calculate from download counts
    },
    system: {
      uptime: 99.9, // Placeholder - get from monitoring system
      avgResponseTime,
      dbConnectionPool,
      memoryUsage: 45 // Placeholder - percentage
    },
    activity: {
      last24h: recentActivities,
      trend: 'up' // Placeholder - calculate from historical data
    },
    admins: {
      total: totalAdmins,
      activeSessions: 3 // Placeholder - get from session management
    }
  }
}

export async function getRecentAlerts(limit = 10) {
  const admin = await ensureAdmin()

  // Placeholder - implement actual alert system
  return [
    {
      id: '1',
      type: 'warning',
      message: 'High memory usage detected',
      timestamp: new Date(Date.now() - 3600000),
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      message: 'Daily backup completed successfully',
      timestamp: new Date(Date.now() - 7200000),
      resolved: true
    }
  ].slice(0, limit)
}