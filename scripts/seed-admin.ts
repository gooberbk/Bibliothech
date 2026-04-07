import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seedAdmin() {
  try {
    const adminEmail = 'admin@estin.dz'
    const adminPassword = 'admin123'

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // Créer l'utilisateur admin
    const hashedPassword = await hash(adminPassword, 12)

    const admin = await prisma.user.create({
      data: {
        name: 'Administrateur ESTIN',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log('✅ Admin user created successfully')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()
