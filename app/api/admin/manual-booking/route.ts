import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
const googleWorkspaceService = require('@/utils/google')
const bookingCache = require('@/lib/bookingCache')

export async function POST(request: NextRequest) {
  try {
    const { 
      patientName, 
      patientEmail, 
      date, 
      time, 
      sessionPackage,
      medicalData,
      notes 
    } = await request.json()

    // Validate required fields
    if (!patientName || !patientEmail || !date || !time || !sessionPackage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create booking token for this manual booking
    const bookingToken = uuidv4()
    
    // Parse the date and time
    const startDateTime = new Date(`${date}T${time}:00.000Z`)
    if (isNaN(startDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      )
    }

    // Calculate end time (50 minutes later)
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + 50)

    const sessionsTotal = googleWorkspaceService.getSessionCountFromPackage(sessionPackage)

    // Patient data is already stored in JSON, skip placeholder creation
    console.log(`📋 Manual booking for ${patientName} (${patientEmail}) - Token: ${bookingToken}`)

    // Create therapy session in Google Calendar
    const calendarResult = await googleWorkspaceService.createTherapySessionBooking({
      bookingToken: bookingToken,
      patientEmail: patientEmail,
      patientName: patientName,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      sessionNumber: 1,
      totalSessions: sessionsTotal,
      sessionPackage: sessionPackage
    })

    if (!calendarResult.success) {
      console.error('Manual booking calendar creation failed:', calendarResult.error)
      return NextResponse.json(
        { error: 'Failed to create calendar event', details: calendarResult.error },
        { status: 500 }
      )
    }

    // TEMPORARILY DISABLED: Send confirmation email (to avoid confusing patient with multiple emails)
    console.log('📧 Email sending temporarily disabled for testing - patient already received previous emails')

    // const emailResult = await googleWorkspaceService.sendBookingConfirmation({
    //   patientEmail: patientEmail,
    //   patientName: patientName,
    //   appointmentDate: startDateTime.toISOString(),
    //   appointmentTime: time,
    //   meetLink: calendarResult.meetLink,
    //   bookingId: calendarResult.bookingId,
    //   sessionType: sessionPackage.name,
    //   sessionNumber: 1,
    //   totalSessions: sessionsTotal
    // })

    // if (!emailResult.success) {
    //   console.warn('Failed to send manual booking confirmation email:', emailResult.error)
    // }

    // Add booking to local cache for immediate dashboard visibility
    // This handles Google Calendar API sync delays (5-30 minutes)
    const cacheBooking = {
      bookingToken: bookingToken,
      bookingId: calendarResult.bookingId,
      eventId: calendarResult.eventId,
      patientName: patientName,
      patientEmail: patientEmail,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      meetLink: calendarResult.meetLink,
      calendarLink: calendarResult.htmlLink,
      sessionPackage: sessionPackage,
      totalSessions: sessionsTotal,
      medicalData: medicalData || {},
      notes: notes || ''
    }

    await bookingCache.addBooking(cacheBooking)
    console.log('💾 Manual booking cached for immediate dashboard visibility')

    return NextResponse.json({
      success: true,
      booking: {
        bookingToken: bookingToken,
        bookingId: calendarResult.bookingId,
        eventId: calendarResult.eventId,
        patientName: patientName,
        patientEmail: patientEmail,
        date: date,
        time: time,
        meetLink: calendarResult.meetLink,
        calendarLink: calendarResult.htmlLink,
        notes: notes || ''
      }
    })

  } catch (error: any) {
    console.error('Manual booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create manual booking', details: error.message },
      { status: 500 }
    )
  }
}