import { db } from "@/lib/db"

type BadgeCheckResult = {
  awardedBadges: Array<{ id: string; name: string; icon: string }>
}

/**
 * Check and award badges based on user actions
 * This function should be called after significant user actions
 */
export async function checkAndAwardBadges(userId: string): Promise<BadgeCheckResult> {
  const awardedBadges: Array<{ id: string; name: string; icon: string }> = []

  try {
    // Get all available badges
    const badges = await db.badge.findMany()

    // Get user's current badge IDs
    const userBadges = await db.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    })
    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId))

    // Get user statistics
    const userStats = await db.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            downloads: true,
            favorites: true,
            activities: true,
          },
        },
      },
    })

    if (!userStats) {
      return { awardedBadges }
    }

    // Check each badge
    for (const badge of badges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) {
        continue
      }

      let shouldAward = false

      switch (badge.requirementType) {
        case "downloads":
          shouldAward = userStats._count.downloads >= badge.requirementValue
          break
        case "favorites":
          shouldAward = userStats._count.favorites >= badge.requirementValue
          break
        case "logins":
          // Count login activities
          const loginCount = await db.userActivity.count({
            where: {
              userId,
              action: "login",
            },
          })
          shouldAward = loginCount >= badge.requirementValue
          break
        case "views":
          // Count unique resource views
          const viewActivities = await db.userActivity.findMany({
            where: {
              userId,
              action: "profile_view",
              entityType: "resource",
            },
            select: { entityId: true },
            distinct: ["entityId"],
          })
          shouldAward = viewActivities.length >= badge.requirementValue
          break
        default:
          shouldAward = false
      }

      if (shouldAward) {
        // Award the badge
        await db.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        })

        awardedBadges.push({
          id: badge.id,
          name: badge.name,
          icon: badge.icon,
        })
      }
    }

    return { awardedBadges }
  } catch (error) {
    console.error("Error checking badges:", error)
    return { awardedBadges }
  }
}

/**
 * Award the "Nouveau Membre" badge on first login
 */
export async function awardNewMemberBadge(userId: string): Promise<void> {
  try {
    const badge = await db.badge.findUnique({
      where: { name: "Nouveau Membre" },
    })

    if (!badge) {
      console.error("Nouveau Membre badge not found")
      return
    }

    // Check if already earned
    const existing = await db.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    })

    if (existing) {
      return
    }

    // Award the badge
    await db.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
    })
  } catch (error) {
    console.error("Error awarding new member badge:", error)
  }
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string) {
  try {
    const userBadges = await db.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: "desc",
      },
    })

    return userBadges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt,
    }))
  } catch (error) {
    console.error("Error getting user badges:", error)
    return []
  }
}