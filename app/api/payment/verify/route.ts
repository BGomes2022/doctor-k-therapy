import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// In production, you would use a proper database
// For now, we'll use a simple in-memory store
const paymentStore = new Map()

// Export for use in other API routes
export const getPaymentRecord = (userId: string) => paymentStore.get(userId)

export async function POST(request: NextRequest) {
  try {
    const { paymentId, sessionPackage, paymentDetails } = await request.json()

    // Verify PayPal payment (in production, you would verify with PayPal API)
    if (!paymentId || !sessionPackage || !paymentDetails) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      )
    }

    // Generate unique user ID
    const userId = uuidv4()
    
    // Store payment information
    const paymentRecord = {
      userId,
      paymentId,
      sessionPackage,
      paymentDetails,
      timestamp: new Date().toISOString(),
      status: 'completed',
      medicalFormCompleted: false,
      bookingLinkSent: false
    }

    paymentStore.set(userId, paymentRecord)

    return NextResponse.json({
      success: true,
      userId,
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID required' },
      { status: 400 }
    )
  }

  const paymentRecord = paymentStore.get(userId)
  
  if (!paymentRecord) {
    return NextResponse.json(
      { error: 'Payment record not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(paymentRecord)
}