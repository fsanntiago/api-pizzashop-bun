import { desc, eq, sum } from 'drizzle-orm'
import Elysia from 'elysia'

import { db } from '../../db/connection'
import { orderItems, products } from '../../db/schema'
import { authentication } from '../authentication'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getPopularProducts = new Elysia()
  .use(authentication)
  .get('/metrics/popular-products', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const popularProducts = await db
      .select({
        product: products.name,
        amount: sum(orderItems.quantity).mapWith(Number),
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .where(eq(products.restaurantId, restaurantId))
      .groupBy(products.name)
      .orderBy(({ amount }) => {
        return desc(amount)
      })
      .limit(5)

    return { popularProducts }
  })
