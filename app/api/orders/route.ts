import { NextRequest, NextResponse } from 'next/server'
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk"

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID || "",
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  },
  timeout: 0,
  environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
})

const ordersController = new OrdersController(client)

export async function POST(request: NextRequest) {
  try {
    const { sessionPackage } = await request.json()

    if (!sessionPackage || !sessionPackage.price) {
      return NextResponse.json(
        { error: 'Missing session package information' },
        { status: 400 }
      )
    }

    const collect = {
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "EUR",
              value: sessionPackage.price.toString(),
              breakdown: {
                itemTotal: {
                  currencyCode: "EUR",
                  value: sessionPackage.price.toString(),
                },
              },
            },
            items: [
              {
                name: sessionPackage.name,
                unitAmount: {
                  currencyCode: "EUR",
                  value: sessionPackage.price.toString(),
                },
                quantity: "1",
                description: sessionPackage.description || sessionPackage.name,
                sku: sessionPackage.id,
              },
            ],
            description: sessionPackage.name,
          },
        ],
        applicationContext: {
          shippingPreference: "NO_SHIPPING",
        },
      },
      prefer: "return=minimal",
    }

    const { body, ...httpResponse } = await ordersController.createOrder(collect)

    return NextResponse.json(
      JSON.parse(body),
      { status: httpResponse.statusCode }
    )

  } catch (error) {
    console.error('Failed to create PayPal order:', error)

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}