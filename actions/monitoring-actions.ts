"use server"

import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"
import { adminActionRateLimit } from "@/lib/rate-limit"

export type ServiceStatus = "healthy" | "warning" | "unhealthy" | "unknown"

export type MonitoringData = {
  overallStatus: ServiceStatus
  services: {
    database: ServiceStatus
    storage: ServiceStatus
    clerk: ServiceStatus
    uploadthing: ServiceStatus
  }
  metrics: {
    database: {
      status: ServiceStatus
      connectionTime: number
      queryTime: number
      message: string
    }
    storage: {
      status: ServiceStatus
      usagePercentage: number
      usedGB: number
      totalGB: number
      message: string
    }
    server: {
      status: ServiceStatus
      uptime: number
      memoryUsage: number
      cpuUsage: number
      message: string
    }
    admins: {
      status: ServiceStatus
      activeCount: number
      totalCount: number
      message: string
    }
  }
  timestamp: string
}

async function checkDatabaseHealth(): Promise<MonitoringData["metrics"]["database"]> {
  const startTime = Date.now()
  
  try {
    // Test database connection with a simple query
    await db.$queryRaw`SELECT 1 as test`
    const connectionTime = Date.now() - startTime
    
    // Test query performance
    const queryStart = Date.now()
    await db.adminAccount.count()
    const queryTime = Date.now() - queryStart
    
    const status: ServiceStatus = connectionTime < 100 && queryTime < 50 ? "healthy" : "warning"
    
    return {
      status,
      connectionTime,
      queryTime,
      message: status === "healthy" 
        ? "Base de données opérationnelle" 
        : "Base de données lente mais fonctionnelle",
    }
  } catch (error) {
    return {
      status: "unhealthy",
      connectionTime: Date.now() - startTime,
      queryTime: 0,
      message: "Base de données inaccessible",
    }
  }
}

async function checkStorageHealth(): Promise<MonitoringData["metrics"]["storage"]> {
  try {
    // Simulate storage check - in production, this would check actual storage
    // For now, we'll estimate based on resource count
    const resourceCount = await db.resource.count()
    
    // Estimate: average resource ~10MB, assume 100GB total storage
    const usedGB = (resourceCount * 10) / 1024
    const totalGB = 100
    const usagePercentage = (usedGB / totalGB) * 100
    
    let status: ServiceStatus
    let message: string
    
    if (usagePercentage < 70) {
      status = "healthy"
      message = "Stockage dans les limites normales"
    } else if (usagePercentage < 90) {
      status = "warning"
      message = "Stockage proche de la limite"
    } else {
      status = "unhealthy"
      message = "Stockage critique - action requise"
    }
    
    return {
      status,
      usagePercentage,
      usedGB,
      totalGB,
      message,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      usagePercentage: 0,
      usedGB: 0,
      totalGB: 100,
      message: "Impossible de vérifier le stockage",
    }
  }
}

async function checkServerHealth(): Promise<MonitoringData["metrics"]["server"]> {
  try {
    // Get server metrics (simplified for MVP)
    const uptime = process.uptime() // seconds since start
    const memoryUsage = process.memoryUsage()
    const memoryUsedMB = memoryUsage.heapUsed / 1024 / 1024
    const memoryTotalMB = memoryUsage.heapTotal / 1024 / 1024
    const memoryPercentage = (memoryUsedMB / memoryTotalMB) * 100
    
    // CPU usage is hard to get accurately in Node.js without external libraries
    // We'll estimate based on memory usage for MVP
    const cpuUsage = Math.min(100, memoryPercentage * 0.8)
    
    let status: ServiceStatus
    let message: string
    
    if (memoryPercentage < 80 && cpuUsage < 80) {
      status = "healthy"
      message = "Serveur opérationnel"
    } else if (memoryPercentage < 90 && cpuUsage < 90) {
      status = "warning"
      message = "Charge serveur élevée"
    } else {
      status = "unhealthy"
      message = "Charge serveur critique"
    }
    
    return {
      status,
      uptime,
      memoryUsage: memoryPercentage,
      cpuUsage,
      message,
    }
  } catch (error) {
    return {
      status: "unknown",
      uptime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      message: "Impossible d'obtenir les métriques serveur",
    }
  }
}

async function checkAdminsHealth(): Promise<MonitoringData["metrics"]["admins"]> {
  try {
    const [activeCount, totalCount] = await Promise.all([
      db.adminAccount.count({ where: { active: true } }),
      db.adminAccount.count(),
    ])
    
    let status: ServiceStatus
    let message: string
    
    if (activeCount === 0) {
      status = "unhealthy"
      message = "Aucun admin actif - action requise"
    } else if (activeCount === 1) {
      status = "warning"
      message = "Admin unique - recommandé d'en ajouter"
    } else {
      status = "healthy"
      message = "Équipe admin opérationnelle"
    }
    
    return {
      status,
      activeCount,
      totalCount,
      message,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      activeCount: 0,
      totalCount: 0,
      message: "Impossible de vérifier les admins",
    }
  }
}

async function checkExternalServices(): Promise<{
  clerk: ServiceStatus
  uploadthing: ServiceStatus
}> {
  // For MVP, we'll assume external services are healthy
  // In production, this would make actual API calls to check service health
  return {
    clerk: "healthy",
    uploadthing: "healthy",
  }
}

export async function getMonitoringData(): Promise<MonitoringData> {
  const admin = await ensureAdminSession()
  
  const { success } = await adminActionRateLimit.limit(admin.id)
  if (!success) {
    throw new Error("Trop de requêtes. Veuillez réessayer plus tard.")
  }

  const [database, storage, server, admins, externalServices] = await Promise.all([
    checkDatabaseHealth(),
    checkStorageHealth(),
    checkServerHealth(),
    checkAdminsHealth(),
    checkExternalServices(),
  ])

  // Calculate overall status
  const allStatuses = [
    database.status,
    storage.status,
    server.status,
    admins.status,
    externalServices.clerk,
    externalServices.uploadthing,
  ]
  
  let overallStatus: ServiceStatus
  if (allStatuses.includes("unhealthy")) {
    overallStatus = "unhealthy"
  } else if (allStatuses.includes("warning") || allStatuses.includes("unknown")) {
    overallStatus = "warning"
  } else {
    overallStatus = "healthy"
  }

  return {
    overallStatus,
    services: {
      database: database.status,
      storage: storage.status,
      clerk: externalServices.clerk,
      uploadthing: externalServices.uploadthing,
    },
    metrics: {
      database,
      storage,
      server,
      admins,
    },
    timestamp: new Date().toISOString(),
  }
}