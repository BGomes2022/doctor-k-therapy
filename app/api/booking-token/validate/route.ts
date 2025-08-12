import { NextRequest, NextResponse } from 'next/server'
const csvHelpers = require('@/utils/csvHelpers')

export async function POST(request: NextRequest) {
  try {
    const { bookingToken } = await request.json()

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    // Ensure CSV structure is up to date
    await csvHelpers.ensureExtendedCSVStructure()

    // Validate token and get session info
    const sessionInfo = await csvHelpers.getRemainingSessionsFromToken(bookingToken)
    
    if (!sessionInfo) {
      return NextResponse.json(
        { error: 'Invalid or expired booking token' },
        { status: 404 }
      )
    }

    // Get booking history for this token
    const bookingHistory = await csvHelpers.getBookingHistoryForToken(bookingToken)

    // Return comprehensive token information
    return NextResponse.json({
      success: true,
      sessionInfo: {
        sessionsTotal: sessionInfo.sessionsTotal,
        sessionsUsed: sessionInfo.sessionsUsed,
        sessionsRemaining: sessionInfo.sessionsRemaining,
        patientEmail: sessionInfo.patientEmail,
        patientName: sessionInfo.patientName,
        expiresAt: sessionInfo.expiresAt.toISOString(),
        isExpired: sessionInfo.isExpired,
        isValid: sessionInfo.isValid
      },
      bookingHistory: bookingHistory.map(booking => ({
        bookingId: booking.bookingId,
        date: booking.date,
        time: booking.time,
        sessionPackage: booking.sessionPackage,
        createdAt: booking.createdAt,
        meetLink: booking.meetLink,
        sessionNumber: booking.sessionNumber,
        status: booking.status
      })),
      canBook: sessionInfo.isValid && sessionInfo.sessionsRemaining > 0
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate booking token' },
      { status: 500 }
    )
  }
}