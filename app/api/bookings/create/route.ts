import { NextRequest, NextResponse } from 'next/server'
import { getPatientByToken } from '@/utils/jsonPatientStorage'
const googleWorkspaceService = require('@/utils/google')

const THERAPIST_TIMEZONE = 'Europe/Lisbon'

// Convert Portugal time to UTC - SIMPLE AND CORRECT
function convertPortugalTimeToUTC(dateStr: string, timeStr: string): Date {
  // Frontend sends Portugal time, we treat it as Portugal time
  // Portugal is UTC+0 (winter) or UTC+1 (summer), but we just treat as UTC for calendar
  return new Date(`${dateStr}T${timeStr}:00.000Z`)
}

// Convert Portugal time to user timezone for email display - SIMPLE
function convertTimeToUserTimezone(timeStr: string, dateStr: string, userTimezone: string): string {
  try {
    // Portugal time as UTC (since we treat it that way in calendar)
    const utcTime = new Date(`${dateStr}T${timeStr}:00.000Z`)
    return utcTime.toLocaleTimeString('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    return timeStr // Fallback
  }
}

// Legacy function kept for compatibility (but not used in new flow)
function convertUserTimeToUTC(dateStr: string, timeStr: string, userTimezone: string): Date {
  try {
    // Create date string in user's timezone format
    const dateTimeStr = `${dateStr}T${timeStr}:00`
    const localDate = new Date(dateTimeStr)

    // Get the time in user's timezone as string
    const userTimeString = localDate.toLocaleString('en-US', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    // Parse back as UTC
    const [datePart, timePart] = userTimeString.split(', ')
    const [month, day, year] = datePart.split('/')
    const [hour, minute] = timePart.split(':')

    return new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      0
    ))
  } catch (error) {
    console.error('Conversion error:', error)
    // Fallback: treat as UTC
    return new Date(`${dateStr}T${timeStr}:00.000Z`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookingToken, selectedDate, selectedTime, userTimezone } = await request.json()

    // Validate input
    if (!bookingToken || !selectedDate || !selectedTime) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingToken, selectedDate, selectedTime' },
        { status: 400 }
      )
    }

    // Default to therapist timezone if user timezone not provided
    const timezone = userTimezone || THERAPIST_TIMEZONE

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
    // IMPORTANT: selectedTime is ALREADY in Portugal timezone from frontend
    console.log('🕐 Timezone conversion:', {
      selectedDate,
      selectedTime: `${selectedTime} (Portugal time)`,
      userTimezone: timezone,
      therapistTimezone: THERAPIST_TIMEZONE
    })

    // Validate time format
    const portugalDateTime = new Date(`${selectedDate}T${selectedTime}:00`)

    if (isNaN(portugalDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      )
    }

    // Convert Portugal time to UTC (correct logic)
    const utcDateTime = convertPortugalTimeToUTC(selectedDate, selectedTime)

    // Convert to user's local time for email display
    const userLocalTime = convertTimeToUserTimezone(selectedTime, selectedDate, timezone)

    console.log('🕐 Converted times:', {
      userLocalTime: userLocalTime,
      portugalTime: selectedTime,
      utcTime: utcDateTime.toISOString(),
      willBeStoredInCalendarAs: utcDateTime.toISOString()
    })

    // Calculate end time based on session type
    const sessionType = sessionInfo.sessionPackage?.sessionType || 'therapy'
    const blockDuration = sessionType === 'consultation' ? 30 : 60 // minutes to block
    const endDateTime = new Date(utcDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + blockDuration)

    const startDateTime = utcDateTime

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
      appointmentTime: userLocalTime, // Use user's local time for email
      portugalTime: selectedTime, // Also send Portugal time for reference
      userTimezone: timezone, // Send user's timezone
      meetLink: calendarResult.meetLink,
      bookingId: calendarResult.bookingId,
      sessionType: sessionInfo.sessionPackage.name,
      sessionNumber: sessionNumber,
      totalSessions: sessionInfo.sessionsTotal
    })

    if (!emailResult.success) {
      console.warn('Failed to send confirmation email:', emailResult.error)
    }

    // Send admin notification about new booking
    try {
      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      await googleWorkspaceService.sendAdminBookingNotification({
        patientName: sessionInfo.patientName,
        appointmentDate: formattedDate,
        appointmentTime: `${selectedTime} (Portugal) / ${userLocalTime} (${timezone})`,
        sessionPackage: sessionInfo.sessionPackage?.name || 'Therapy Session',
        remainingSessions: `${sessionInfo.sessionsRemaining - 1} of ${sessionInfo.sessionsTotal}`
      })
    } catch (adminEmailError) {
      console.warn('Failed to send admin notification:', adminEmailError)
      // Don't fail the booking if admin email fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      booking: {
        bookingId: calendarResult.bookingId,
        eventId: calendarResult.eventId,
        date: selectedDate,
        time: userLocalTime, // Show user's local time in response
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