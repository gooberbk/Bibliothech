import { createHmac, timingSafeEqual, randomBytes } from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

const cookieName = "bibliothech_admin_session"
const maxAgeSeconds = 60 * 60 * 8 // 8 hours
const sessionVersion = "v1" // For future session migration

type AdminSessionPayload = {
  sub: string
  username: string
  exp: number
  iat: number
  version: string
  jti: string // JWT ID for session tracking
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.CLERK_SECRET_KEY
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production")
  }
  return secret || "bibliothech-local-admin-session-secret"
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url")
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url")
}

function verifySignature(value: string, signature: string) {
  const expected = sign(value)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  )
}

function generateSessionId(): string {
  return randomBytes(16).toString("hex")
}

export async function createAdminSession(admin: { id: string; username: string }) {
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminSessionPayload = {
    sub: admin.id,
    username: admin.username,
    exp: now + maxAgeSeconds,
    iat: now,
    version: sessionVersion,
    jti: generateSessionId(),
  }
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const session = `${encodedPayload}.${sign(encodedPayload)}`
  const cookieStore = await cookies()

  cookieStore.set(cookieName, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
    // Additional security attributes
    ...(process.env.NODE_ENV === "production" && {
      domain: process.env.ADMIN_COOKIE_DOMAIN,
    }),
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(cookieName)
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const rawSession = cookieStore.get(cookieName)?.value
  if (!rawSession) {
    return null
  }

  const [encodedPayload, signature] = rawSession.split(".")
  if (!encodedPayload || !signature || !verifySignature(encodedPayload, signature)) {
    // Invalid signature - clear the cookie
    await clearAdminSession()
    return null
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AdminSessionPayload
    
    // Validate required fields
    if (!payload.sub || !payload.username || !payload.exp || !payload.iat) {
      await clearAdminSession()
      return null
    }

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      await clearAdminSession()
      return null
    }

    // Check session version for future migrations
    if (payload.version !== sessionVersion) {
      await clearAdminSession()
      return null
    }

    // Verify admin still exists and is active
    const admin = await db.adminAccount.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, name: true, active: true, updatedAt: true },
    })

    if (!admin?.active) {
      await clearAdminSession()
      return null
    }

    // Additional security: check if admin was updated after session creation
    // This allows for immediate session invalidation on password changes
    const sessionCreationTime = new Date(payload.iat * 1000)
    if (admin.updatedAt > sessionCreationTime) {
      await clearAdminSession()
      return null
    }

    return admin
  } catch (error) {
    // Invalid payload format - clear the cookie
    await clearAdminSession()
    return null
  }
}

export async function requireAdminSession() {
  const admin = await getAdminSession()
  if (!admin) {
    redirect("/admin-login")
  }
  return admin
}

export async function ensureAdminSession() {
  const admin = await getAdminSession()
  if (!admin) {
    throw new Error("Connexion admin requise")
  }
  return admin
}

// New function to invalidate all sessions for an admin
export async function invalidateAdminSessions(adminId: string) {
  await db.adminAccount.update({
    where: { id: adminId },
    data: { updatedAt: new Date() },
  })
}
