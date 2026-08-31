import { db } from '@/lib/db'
import { categories } from '@/lib/data'

async function seedCategories() {
  console.log('🌱 Seeding categories...')

  for (const categoryName of categories) {
    const slug = categoryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const category = await db.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        slug,
      },
    })

    console.log(`✅ Created/updated category: ${category.name}`)

    // Update existing resources to use the new categoryId
    const updatedResources = await db.resource.updateMany({
      where: {
        category: categoryName,
      },
      data: {
        categoryId: category.id,
      },
    })

    console.log(`📚 Updated ${updatedResources.count} resources for category: ${category.name}`)
  }

  console.log('✨ Categories seeded successfully!')
}

async function seedBadges() {
  console.log('🏆 Seeding badges...')

  const badges = [
    {
      name: 'Nouveau Membre',
      description: 'Bienvenue sur la plateforme !',
      icon: '🎉',
      requirementType: 'login',
      requirementValue: 1,
    },
    {
      name: 'Bibliophile',
      description: 'Téléchargé 10 ressources',
      icon: '📚',
      requirementType: 'downloads',
      requirementValue: 10,
    },
    {
      name: 'Collectionneur',
      description: 'Ajouté 10 favoris',
      icon: '⭐',
      requirementType: 'favorites',
      requirementValue: 10,
    },
    {
      name: 'Actif',
      description: '5 connexions à la plateforme',
      icon: '🔥',
      requirementType: 'logins',
      requirementValue: 5,
    },
    {
      name: 'Explorateur',
      description: 'Vu 20 ressources différentes',
      icon: '🔍',
      requirementType: 'views',
      requirementValue: 20,
    },
  ]

  for (const badge of badges) {
    await db.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    })
    console.log(`✅ Created/updated badge: ${badge.name}`)
  }

  console.log('✨ Badges seeded successfully!')
}

async function main() {
  try {
    await seedCategories()
    await seedBadges()
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
