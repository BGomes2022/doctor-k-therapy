import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
const googleWorkspaceService = require('@/utils/googleWorkspace')

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

    // Create placeholder event first to store patient data
    const placeholderResult = await googleWorkspaceService.createMedicalDataPlaceholder({
      bookingToken,
      patientEmail,
      patientName,
      sessionPackage,
      medicalData: medicalData || {}
    })

    if (!placeholderResult.success) {
      return NextResponse.json(
        { error: 'Failed to store patient data', details: placeholderResult.error },
        { status: 500 }
      )
    }

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