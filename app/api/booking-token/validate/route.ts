import { NextRequest, NextResponse } from 'next/server'
import { getPatientByToken } from '@/utils/jsonPatientStorage'
const googleWorkspaceService = require('@/utils/google')

export async function POST(request: NextRequest) {
  try {
    const { bookingToken } = await request.json()

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    // Get patient info from JSON storage
    const patientResult = await getPatientByToken(bookingToken)
    
    if (!patientResult.success) {
      return NextResponse.json(
        { error: 'Invalid or expired booking token' },
        { status: 404 }
      )
    }

    const patient = patientResult.patient
    console.log('🔍 DEBUG Patient Object:', JSON.stringify(patient, null, 2))

    // Get booking history from Google Calendar (actual therapy sessions)
    const bookingHistory = await googleWorkspaceService.getBookingHistoryForToken(bookingToken)
    
    // Calculate session counts
    const sessionsUsed = bookingHistory.length
    const sessionsTotal = patient.sessionInfo?.sessionsTotal || 1
    const sessionsRemaining = sessionsTotal - sessionsUsed
    
    // Check expiry from JSON data (already calculated)
    const validUntilStr = patient.sessionInfo?.validUntil || patient.basicInfo?.createdAt
    const validUntil = validUntilStr ? new Date(validUntilStr) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months from now
    const isExpired = new Date() > validUntil

    // Return comprehensive token information
    return NextResponse.json({
      success: true,
      sessionInfo: {
        sessionsTotal,
        sessionsUsed,
        sessionsRemaining,
        patientEmail: patient.basicInfo?.email || 'Unknown',
        patientName: patient.basicInfo?.fullName || 'Unknown',
        expiresAt: validUntil.toISOString(),
        isExpired,
        isValid: sessionsRemaining > 0 && !isExpired,
        sessionPackage: patient.sessionInfo
      },
      bookingHistory: bookingHistory.map(booking => ({
        eventId: booking.eventId,
        date: booking.date,
        time: booking.time,
        sessionPackage: booking.sessionPackage,
        createdAt: booking.createdAt,
        meetLink: booking.meetLink,
        sessionNumber: booking.sessionNumber,
        status: booking.status
      })),
      canBook: sessionsRemaining > 0 && !isExpired
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate booking token' },
      { status: 500 }
    )
  }
}

// Note: Session counts are now stored directly in JSON patient.sessionInfo.sessionsTotal