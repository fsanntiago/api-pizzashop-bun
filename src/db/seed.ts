import { faker } from '@faker-js/faker'
import chalk from 'chalk'

import { db } from './connection'
import { restaurants, users } from './schema'

/**
 * Reset database
 */
await db.delete(users)
await db.delete(restaurants)

console.log(chalk.yellow('✓ Database reset!'))

/**
 * Create customers
 */
await db.insert(users).values([
  {
    email: faker.internet.email(),
    name: faker.person.firstName(),
    role: 'customer',
  },
  {
    email: faker.internet.email(),
    name: faker.person.firstName(),
    role: 'customer',
  },
])

console.log(chalk.yellow('✓ Created customers!'))

/**
 * Create manager
 */
const [manager] = await db
  .insert(users)
  .values([
    {
      email: 'admin@admin.com',
      name: faker.person.firstName(),
      role: 'manager',
    },
  ])
  .returning({ id: users.id })

console.log(chalk.yellow('✓ Created manager!'))

/**
 * Create restaurant
 */
await db.insert(restaurants).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id,
  },
])

console.log(chalk.yellow('✓ Created restaurant!'))

console.log(chalk.greenBright('Database seeded successfully!'))

process.exit()
