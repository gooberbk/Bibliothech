const NEON_DATABASE_URL =
  "postgresql://neondb_owner:npg_bh0LpRD6KZki@ep-lucky-recipe-ag9fkb4j.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

process.env.DATABASE_URL ||= NEON_DATABASE_URL
process.env.DIRECT_URL ||= NEON_DATABASE_URL

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
