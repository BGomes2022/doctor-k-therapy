import { NextRequest, NextResponse } from 'next/server'
import {
  ApiError,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk"
import { v4 as uuidv4 } from 'uuid'

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

// In production, you would use a proper database
const paymentStore = new Map()

export async function POST(
  request: NextRequest,
  { params }: { params: { orderID: string } }
) {
  try {
    const { orderID } = params

    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const collect = {
      id: orderID,
      prefer: "return=minimal",
    }

    const { body, ...httpResponse } = await ordersController.captureOrder(collect)
    const orderData = JSON.parse(body)

    console.log('✅ PayPal order captured:', orderData)

    // Generate unique user ID for session tracking
    const userId = uuidv4()

    // Extract session package info from order (you might need to pass this differently)
    const sessionPackage = {
      id: orderData.purchase_units?.[0]?.items?.[0]?.sku || 'unknown',
      name: orderData.purchase_units?.[0]?.items?.[0]?.name || 'Therapy Session',
      price: parseFloat(orderData.purchase_units?.[0]?.amount?.value || '0'),
    }

    // Store payment information for later reference
    const paymentRecord = {
      userId,
      paymentId: orderData.id,
      sessionPackage,
      paymentDetails: orderData,
      timestamp: new Date().toISOString(),
      status: 'completed',
      medicalFormCompleted: false,
      bookingLinkSent: false
    }

    paymentStore.set(userId, paymentRecord)

    // Add userId to response for frontend
    const responseData = {
      ...orderData,
      userId,
      sessionPackage
    }

    return NextResponse.json(
      responseData,
      { status: httpResponse.statusCode }
    )

  } catch (error) {
    console.error('Failed to capture PayPal order:', error)

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to capture order' },
      { status: 500 }
    )
  }
}

// Export function to get payment records (for other API routes)
export const getPaymentRecord = (userId: string) => paymentStore.get(userId)