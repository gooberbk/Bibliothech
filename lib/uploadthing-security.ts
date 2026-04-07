const TRUSTED_UPLOADTHING_HOSTS = [
  "utfs.io",
  "ufs.sh",
  "uploadthing.com",
] as const

const isTrustedHost = (hostname: string) =>
  TRUSTED_UPLOADTHING_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  )

export const isSecureUploadthingUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl)
    return parsed.protocol === "https:" && isTrustedHost(parsed.hostname)
  } catch {
    return false
  }
}
