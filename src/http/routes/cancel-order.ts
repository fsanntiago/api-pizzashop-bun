import { eq } from 'drizzle-orm'
import Elysia, { t } from 'elysia'

import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { authentication } from '../authentication'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const cancelOrder = new Elysia().use(authentication).patch(
  '/orders/:orderId/cancel',
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params

    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.restaurantId, restaurantId),
          eq(fields.id, orderId),
        )
      },
    })

    if (!order) {
      set.status = 400
      return { message: 'Order not found.' }
    }

    if (!['pending', 'processing'].includes(order.status)) {
      set.status = 400
      return { message: 'You cannot cancel orders after dispatch.' }
    }

    await db
      .update(orders)
      .set({ status: 'canceled' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
