import Elysia, { t } from 'elysia'
import { z } from 'zod'

import { db } from '../../db/connection'
import { authentication } from '../authentication'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getEvaluations = new Elysia().use(authentication).get(
  '/evaluations',
  async ({ query, set, getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      set.status = 401

      throw new UnauthorizedError()
    }

    const { pageIndex } = z
      .object({
        pageIndex: z.coerce.number().default(0),
      })
      .parse(query)

    const evaluations = await db.query.evaluations.findMany({
      offset: pageIndex * 10,
      limit: 10,
      orderBy: (evaluations, { desc }) => desc(evaluations.createdAt),
    })

    return evaluations
  },
  {
    query: t.Object({
      pageIndex: t.Numeric({ minimum: 0 }),
    }),
  },
)
