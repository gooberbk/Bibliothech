"use server"

import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"

const ensureAdmin = async () => {
  return ensureAdminSession()
}

export async function getDashboardStats() {
  await ensureAdmin()

  const [totalResources, totalUsers, totalAdmins, totalCategories, totalDownloads, totalFavorites] =
    await Promise.all([
      db.resource.count(),
      db.user.count(),
      db.adminAccount.count({ where: { active: true } }),
      db.category.count(),
      db.download.count(),
      db.favorite.count(),
    ])

  return {
    totalResources,
    totalUsers,
    totalAdmins,
    totalCategories,
    totalDownloads,
    totalFavorites,
  }
}

export async function getActivityChartData() {
  await ensureAdmin()

  // Get data for the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Get daily download counts
  const downloads = await db.$queryRaw<Array<{ date: string; count: number }>>`
    SELECT 
      DATE("createdAt") as date,
      COUNT(*) as count
    FROM "Download"
    WHERE "createdAt" >= ${sevenDaysAgo}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `

  // Get daily favorite counts
  const favorites = await db.$queryRaw<Array<{ date: string; count: number }>>`
    SELECT 
      DATE("createdAt") as date,
      COUNT(*) as count
    FROM "Favorite"
    WHERE "createdAt" >= ${sevenDaysAgo}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `

  // Generate all dates for the last 7 days
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }

  // Fill in missing dates with 0
  const downloadData = dates.map(date => {
    const found = downloads.find(d => d.date === date)
    return { date, count: found ? Number(found.count) : 0 }
  })

  const favoriteData = dates.map(date => {
    const found = favorites.find(f => f.date === date)
    return { date, count: found ? Number(found.count) : 0 }
  })

  return {
    downloads: downloadData,
    favorites: favoriteData,
  }
}

export async function getSystemHealth() {
  await ensureAdmin()

  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`
    const databaseStatus = "healthy"
  } catch (error) {
    return {
      databaseStatus: "unhealthy",
      storageUsed: 0,
      activeAdmins: 0,
      serverTimestamp: new Date().toISOString(),
    }
  }

  // Calculate storage used from resources
  const resources = await db.resource.findMany({
    select: { fileSizeMb: true },
  })
  const storageUsed = resources.reduce((sum, r) => sum + r.fileSizeMb, 0)

  // Get active admin count
  const activeAdmins = await db.adminAccount.count({
    where: { active: true },
  })

  return {
    databaseStatus: "healthy",
    storageUsed: Math.round(storageUsed),
    storageUnit: "MB",
    activeAdmins,
    serverTimestamp: new Date().toISOString(),
  }
}

export async function getTopResources(limit = 5) {
  await ensureAdmin()

  return db.resource.findMany({
    orderBy: { downloadCount: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      author: true,
      category: true,
      downloadCount: true,
      createdAt: true,
    },
  })
}

export async function getTopUsers(limit = 5) {
  await ensureAdmin()

  return db.user.findMany({
    orderBy: {
      downloads: {
        _count: "desc",
      },
    },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          downloads: true,
          favorites: true,
        },
      },
    },
  })
}