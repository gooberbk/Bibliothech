import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ensureAdminSession } from "@/lib/admin-session"

export async function GET() {
  try {
    const admin = await ensureAdminSession()
    
    const adminCount = await db.user.count({
      where: { role: "ADMIN" },
    })

    return NextResponse.json({ count: adminCount })
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
}