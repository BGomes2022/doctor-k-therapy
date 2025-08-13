import { NextRequest, NextResponse } from 'next/server'
import { getPatientByToken } from '@/utils/patientData'
const googleWorkspaceService = require('@/utils/googleWorkspace')

export async function POST(request: NextRequest) {
  try {
    const { bookingToken } = await request.json()

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    // Get patient info from CSV
    const patientResult = await getPatientByToken(bookingToken)
    
    if (!patientResult.success) {
      return NextResponse.json(
        { error: 'Invalid or expired booking token' },
        { status: 404 }
      )
    }

    const patient = patientResult.patient

    // Get booking history from Google Calendar (actual therapy sessions)
    const bookingHistory = await googleWorkspaceService.getBookingHistoryForToken(bookingToken)
    
    // Calculate session counts
    const sessionsUsed = bookingHistory.length
    const sessionsTotal = getSessionCountFromPackage(patient.sessionPackage)
    const sessionsRemaining = sessionsTotal - sessionsUsed
    
    // Check expiry (3 months from creation)
    const createdAt = new Date(patient.createdAt)
    const expiresAt = new Date(createdAt)
    expiresAt.setMonth(expiresAt.getMonth() + 3)
    const isExpired = new Date() > expiresAt

    // Return comprehensive token information
    return NextResponse.json({
      success: true,
      sessionInfo: {
        sessionsTotal,
        sessionsUsed,
        sessionsRemaining,
        patientEmail: patient.patientEmail,
        patientName: patient.patientName,
        expiresAt: expiresAt.toISOString(),
        isExpired,
        isValid: sessionsRemaining > 0 && !isExpired,
        sessionPackage: patient.sessionPackage
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

// Helper function to get session count from package
function getSessionCountFromPackage(sessionPackage: any): number {
  if (!sessionPackage) return 1
  
  const packageName = sessionPackage.name?.toLowerCase() || ''
  
  if (packageName.includes('1 session') || packageName.includes('consultation')) return 1
  if (packageName.includes('4 session')) return 4
  if (packageName.includes('6 session')) return 6
  if (packageName.includes('8 session')) return 8
  
  return 4 // Default
}