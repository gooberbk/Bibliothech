import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { syncClerkUser } from "@/lib/clerk-sync"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Sync Clerk user with database
    await syncClerkUser(userId, {})

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        bio: true,
        socialLinks: true,
        academicInfo: true,
        profileVisible: true,
        activityVisible: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    )
  }
}
