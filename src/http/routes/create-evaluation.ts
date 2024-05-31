import Elysia, { t } from 'elysia'

import { db } from '../../db/connection'
import { evaluations } from '../../db/schema'
import { authentication } from '../authentication'

export const createEvaluation = new Elysia().use(authentication).post(
  '/evaluations',
  async ({ body, getCurrentUser, set }) => {
    const { userId } = await getCurrentUser()
    const { restaurantId, rate, comment } = body

    await db.insert(evaluations).values({
      restaurantId,
      customerId: userId,
      rate,
      comment,
    })

    set.status = 201
  },
  {
    body: t.Object({
      restaurantId: t.String(),
      rate: t.Integer({ minimum: 1, maximum: 5 }),
      comment: t.Optional(t.String()),
    }),
  },
)
