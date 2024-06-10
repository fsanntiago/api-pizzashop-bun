import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'
import Elysia, { type Static, t } from 'elysia'

import { env } from '../env'
import { UnauthorizedError } from './errors/unauthorized-error'

export const authCookieSchema = { cookie: t.Cookie({ auth: t.String() }) }

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const authentication = new Elysia()
  .error({ UNAUTHORIZED: UnauthorizedError })
  .onError({ as: 'scoped' }, ({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED':
        set.status = 401
        return { code, message: error.message }
    }
  })
  .guard(authCookieSchema)
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    }),
  )
  .use(cookie())
  .derive({ as: 'scoped' }, ({ jwt, cookie: { auth } }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const token = await jwt.sign(payload)

        auth.set({
          value: token,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days,
          path: '/',
        })
      },

      signOut: () => {
        auth.remove()
      },

      getCurrentUser: async () => {
        const payload = await jwt.verify(auth.value)

        if (!payload) {
          throw new UnauthorizedError()
        }

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
  .derive({ as: 'scoped' }, ({ getCurrentUser }) => {
    return {
      getManagedRestaurantId: async () => {
        const { restaurantId } = await getCurrentUser()

        if (!restaurantId) {
          throw new UnauthorizedError()
        }

        return restaurantId
      },
    }
  })

// const ae = new Elysia().derive({ as: 'scoped' }, () => ({ sub: 'hi' }))
