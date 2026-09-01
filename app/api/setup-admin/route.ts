import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashAdminPassword } from '@/lib/admin-password'

export const dynamic = 'force-dynamic'

// ⚠️ SECURITY WARNING: This endpoint should be removed after initial setup
// It allows admin account creation without authentication for initial setup
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password, name, setupKey } = body

    // Simple security check - require a setup key
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY || 'initial-setup-2024'
    if (setupKey !== expectedSetupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      )
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const normalizedUsername = username.trim().toLowerCase()

    // Check if admin already exists
    const existingAdmin = await db.adminAccount.findUnique({
      where: { username: normalizedUsername }
    })

    const admin = existingAdmin
      ? await db.adminAccount.update({
          where: { id: existingAdmin.id },
          data: {
            name: name || existingAdmin.name,
            passwordHash: hashAdminPassword(password),
            active: true
          }
        })
      : await db.adminAccount.create({
          data: {
            username: normalizedUsername,
            name: name || 'Administrator',
            passwordHash: hashAdminPassword(password)
          }
        })

    return NextResponse.json({
      success: true,
      message: existingAdmin ? 'Admin account updated' : 'Admin account created',
      admin: {
        username: admin.username,
        name: admin.name,
        active: admin.active
      }
    })

  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin account', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await db.$disconnect()
  }
}