import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

const cookieName = "bibliothech_admin_session"
const maxAgeSeconds = 60 * 60 * 8

type AdminSessionPayload = {
  sub: string
  username: string
  exp: number
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

export async function createAdminSession(admin: { id: string; username: string }) {
  const payload: AdminSessionPayload = {
    sub: admin.id,
    username: admin.username,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
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
    return null
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AdminSessionPayload
    if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    const admin = await db.adminAccount.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, name: true, active: true },
    })

    if (!admin?.active) {
      return null
    }

    return admin
  } catch {
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
