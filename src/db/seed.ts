import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'
import chalk from 'chalk'

import { db } from './connection'
import {
  authLinks,
  orderItems,
  orders,
  products,
  restaurants,
  users,
} from './schema'

/**
 * Reset database
 */
await db.delete(orderItems)
await db.delete(orders)
await db.delete(products)
await db.delete(restaurants)
await db.delete(authLinks)
await db.delete(users)

console.log(chalk.yellow('✓ Database reset!'))

/**
 * Create customers
 */
const [customer1, customer2] = await db
  .insert(users)
  .values([
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
  .returning()

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
const [restaurant] = await db
  .insert(restaurants)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning()

console.log(chalk.yellow('✓ Created restaurant!'))

/**
 * Create products
 */
function generateProduct() {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    priceInCents: Number(
      faker.commerce.price({
        min: 190,
        max: 490,
        dec: 0,
      }),
    ),
    restaurantId: restaurant.id,
  }
}

const availableProducts = await db
  .insert(products)
  .values([
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct(),
  ])
  .returning()

console.log(chalk.yellow('✓ Created products!'))

/**
 * Create orders
 */

type OrderItemsInsert = typeof orderItems.$inferInsert
type OrderInsert = typeof orders.$inferInsert

const orderItemsToInsert: OrderItemsInsert[] = []
const orderToInsert: OrderInsert[] = []

for (let i = 0; i < 200; i++) {
  const orderId = createId()

  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 3,
  })

  let totalInCents = 0

  orderProducts.forEach((orderProduct) => {
    const quantity = faker.number.int({ min: 1, max: 3 })

    totalInCents += orderProduct.priceInCents * quantity

    orderItemsToInsert.push({
      orderId,
      productId: orderProduct.id,
      priceInCents: orderProduct.priceInCents,
      quantity,
    })
  })

  orderToInsert.push({
    id: orderId,
    restaurantId: restaurant.id,
    customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
    totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'delivering',
      'delivered',
      'canceled',
    ]),
    createdAt: faker.date.recent({ days: 40 }),
  })
}

await db.insert(orders).values(orderToInsert)
await db.insert(orderItems).values(orderItemsToInsert)

console.log(chalk.yellow('✓ Created orders!'))

console.log(chalk.greenBright('Database seeded successfully!'))

process.exit()
