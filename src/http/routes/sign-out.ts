import Elysia from 'elysia'

import { authCookieSchema, authentication } from '../authentication'

export const signOut = new Elysia().use(authentication).post(
  '/sign-out',
  async ({ signOut: internalSignOut }) => {
    internalSignOut()
  },
  authCookieSchema,
)
