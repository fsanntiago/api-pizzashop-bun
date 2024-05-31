import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'

import { authentication } from './authentication'
import { approveOrder } from './routes/approve-order'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { cancelOrder } from './routes/cancel-order'
import { createEvaluation } from './routes/create-evaluation'
import { deliverOrder } from './routes/deliver-order'
import { dispatchOrder } from './routes/dispatch-order'
import { getDailyRevenueInPeriod } from './routes/get-daily-renevue-in-period'
import { getDayOrdersAmount } from './routes/get-day-orders-amount'
import { getEvaluations } from './routes/get-evaluation'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getMonthCanceledOrdersAmount } from './routes/get-month-canceled-orders-amount'
import { getMonthOrdersAmount } from './routes/get-month-orders-amount'
import { getMonthRevenue } from './routes/get-month-revenue'
import { getOrderDetails } from './routes/get-order-details'
import { getOrders } from './routes/get-orders'
import { getPopularProducts } from './routes/get-popular-products'
import { getProfile } from './routes/get-profile'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { signOut } from './routes/sign-out'
import { updateMenu } from './routes/update-manu'

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Pizza Shop API Documentation',
          version: '1.0.0',
        },
        tags: [
          { name: 'Auth', description: '' },
          { name: 'Metrics', description: '' },
          { name: 'Orders', description: '' },
        ],
      },
    }),
  )
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type'],
      origin: (request): boolean => {
        const origin = request.headers.get('origin')

        if (!origin) {
          return false
        }

        return true
      },
    }),
  )
  .use(authentication)
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(dispatchOrder)
  .use(deliverOrder)
  .use(cancelOrder)
  .use(getOrders)
  .use(getMonthRevenue)
  .use(getDayOrdersAmount)
  .use(getMonthOrdersAmount)
  .use(getMonthCanceledOrdersAmount)
  .use(getPopularProducts)
  .use(getDailyRevenueInPeriod)
  .use(createEvaluation)
  .use(getEvaluations)
  .use(updateMenu)
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = error.status
        return error.toResponse()
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
      default: {
        console.error(error)

        return new Response(null, { status: 500 })
      }
    }
  })

app.listen(3333, () => {
  console.log('🚀 HTTP server running!')
})
