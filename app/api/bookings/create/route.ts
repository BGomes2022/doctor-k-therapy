import { NextRequest, NextResponse } from 'next/server'
import { getPatientByToken } from '@/utils/jsonPatientStorage'
const googleWorkspaceService = require('@/utils/googleWorkspace')

export async function POST(request: NextRequest) {
  try {
    const { bookingToken, selectedDate, selectedTime } = await request.json()

    // Validate input
    if (!bookingToken || !selectedDate || !selectedTime) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingToken, selectedDate, selectedTime' },
        { status: 400 }
      )
    }

    // Get patient info from JSON storage (not Google Calendar)
    const patientResult = await getPatientByToken(bookingToken)
    if (!patientResult.success) {
      return NextResponse.json(
        { error: 'Invalid or expired booking token' },
        { status: 404 }
      )
    }

    const patient = patientResult.patient

    // Get booking history to calculate sessions used
    const bookingHistory = await googleWorkspaceService.getBookingHistoryForToken(bookingToken)
    const sessionsUsed = bookingHistory.length
    // IMPORTANT: Use sessionsTotal from patient.sessionInfo which includes ALL purchased sessions (including upgrades)
    const sessionsTotal = patient.sessionInfo?.sessionsTotal || patient.sessionPackage?.sessionsTotal || 1
    const sessionsRemaining = sessionsTotal - sessionsUsed
    
    console.log('🔍 Session calculation:', {
      sessionsTotal: sessionsTotal,
      sessionsUsed: sessionsUsed,
      sessionsRemaining: sessionsRemaining,
      patientSessionInfo: patient.sessionInfo
    })

    // Create sessionInfo object for compatibility
    const sessionInfo = {
      patientEmail: patient.basicInfo?.email,
      patientName: patient.basicInfo?.fullName,
      sessionsTotal: sessionsTotal,
      sessionsUsed: sessionsUsed,
      sessionsRemaining: sessionsRemaining,
      isValid: sessionsRemaining > 0,
      sessionPackage: patient.sessionInfo || { name: 'Therapy Session', sessionType: 'therapy' }
    }

    // Check if user has remaining sessions
    if (!sessionInfo.isValid || sessionInfo.sessionsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No remaining sessions available' },
        { status: 400 }
      )
    }

    // Parse and validate the selected time
    const startDateTime = new Date(`${selectedDate}T${selectedTime}:00.000Z`)
    if (isNaN(startDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      )
    }

    // Calculate end time based on session type
    const sessionType = sessionInfo.sessionPackage?.sessionType || 'therapy'
    const blockDuration = sessionType === 'consultation' ? 30 : 60 // minutes to block
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + blockDuration)

    // Calculate session number
    const sessionNumber = sessionInfo.sessionsUsed + 1

    // Create therapy session in Google Calendar
    console.log('🔍 DEBUG - Sending to Google Calendar:', {
      patientEmail: sessionInfo.patientEmail,
      patientName: sessionInfo.patientName,
      sessionPackage: sessionInfo.sessionPackage
    })
    
    const calendarResult = await googleWorkspaceService.createTherapySessionBooking({
      bookingToken: bookingToken,
      patientEmail: sessionInfo.patientEmail,
      patientName: sessionInfo.patientName,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      sessionNumber: sessionNumber,
      totalSessions: sessionInfo.sessionsTotal,
      sessionPackage: sessionInfo.sessionPackage
    })

    if (!calendarResult.success) {
      console.error('Calendar booking failed:', calendarResult.error)
      return NextResponse.json(
        { error: 'Failed to create calendar event', details: calendarResult.error },
        { status: 500 }
      )
    }

    // Session usage is automatically tracked by Google Calendar events count
    console.log(`✅ Session ${sessionNumber}/${sessionInfo.sessionsTotal} booked for ${sessionInfo.patientName}`)

    // Send booking confirmation email
    const emailResult = await googleWorkspaceService.sendBookingConfirmation({
      patientEmail: sessionInfo.patientEmail,
      patientName: sessionInfo.patientName,
      appointmentDate: startDateTime.toISOString(),
      appointmentTime: selectedTime,
      meetLink: calendarResult.meetLink,
      bookingId: calendarResult.bookingId,
      sessionType: sessionInfo.sessionPackage.name,
      sessionNumber: sessionNumber,
      totalSessions: sessionInfo.sessionsTotal
    })

    if (!emailResult.success) {
      console.warn('Failed to send confirmation email:', emailResult.error)
    }

    // Return success response
    return NextResponse.json({
      success: true,
      booking: {
        bookingId: calendarResult.bookingId,
        eventId: calendarResult.eventId,
        date: selectedDate,
        time: selectedTime,
        duration: sessionType === 'consultation' ? '30 minutes' : '60 minutes',
        patientName: sessionInfo.patientName,
        patientEmail: sessionInfo.patientEmail,
        sessionNumber: sessionNumber,
        totalSessions: sessionInfo.sessionsTotal,
        meetLink: calendarResult.meetLink,
        calendarLink: calendarResult.htmlLink,
        remainingSessions: sessionInfo.sessionsRemaining - 1
      }
    })

  } catch (error: any) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}