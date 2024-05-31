import Elysia, { t } from 'elysia'

import { db } from '../../db/connection'
import { authentication } from '../authentication'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getOrderDetails = new Elysia().use(authentication).get(
  '/orders/:orderId',
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      columns: {
        id: true,
        status: true,
        totalInCents: true,
        createdAt: true,
      },
      with: {
        customer: { columns: { name: true, phone: true, email: true } },
        items: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true,
          },
          with: { product: { columns: { name: true } } },
        },
      },
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

    return { order }
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
    detail: {
      tags: ['Orders'],
    },
  },
)
