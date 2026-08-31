import { db } from '@/lib/db'
import { headers } from 'next/headers'

export async function trackUserActivity(params: {
  userId: string
  action: string
  entityId?: string
  entityType?: string
  metadata?: Record<string, any>
}) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    await db.userActivity.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityId: params.entityId,
        entityType: params.entityType,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Error tracking user activity:', error)
    // Don't throw - activity tracking shouldn't break the main flow
  }
}

export async function getUserActivities(userId: string, limit = 50) {
  return db.userActivity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function cleanupOldActivities(daysToKeep = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const result = await db.userActivity.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })

  return result.count
}
