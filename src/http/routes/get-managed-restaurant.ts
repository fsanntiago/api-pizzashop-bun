import Elysia from 'elysia'

import { db } from '../../db/connection'
import { authentication } from '../authentication'

export const getManagedRestaurant = new Elysia().use(authentication).get(
  '/managed-restaurant',
  async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new Error('User is not a manager.')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })

    return { managedRestaurant }
  },
  {
    detail: {
      tags: ['Metrics'],
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: {},
            },
          },
        },
      },
    },
  },
)
