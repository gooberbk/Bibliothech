import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

const keyLength = 64

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, keyLength).toString("hex")
  return `scrypt:${salt}:${hash}`
}

export function verifyAdminPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedHash] = passwordHash.split(":")
  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false
  }

  const storedBuffer = Buffer.from(storedHash, "hex")
  const candidateBuffer = scryptSync(password, salt, storedBuffer.length)

  return (
    storedBuffer.length === candidateBuffer.length &&
    timingSafeEqual(storedBuffer, candidateBuffer)
  )
}
