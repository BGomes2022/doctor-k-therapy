import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
const googleWorkspaceService = require('@/utils/googleWorkspace')

export async function POST(request: NextRequest) {
  try {
    const { 
      patientId,
      patientName, 
      patientEmail, 
      date, 
      time,
      duration = 50, // Support custom duration, default 50 minutes
      sessionPackage,
      medicalData 
    } = await request.json()

    // Validate required fields
    if (!patientName || !patientEmail || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Parse the date and time
    const startDateTime = new Date(`${date}T${time}:00.000Z`)
    if (isNaN(startDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      )
    }

    // Calculate end time based on duration
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + duration)

    const sessionsTotal = googleWorkspaceService.getSessionCountFromPackage(sessionPackage)

    // Create therapy session in Google Calendar with video meeting
    const calendarResult = await googleWorkspaceService.createTherapySessionBooking({
      bookingToken: patientId,
      patientEmail: patientEmail,
      patientName: patientName,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      sessionNumber: 1,
      totalSessions: sessionsTotal,
      sessionPackage: sessionPackage
    })

    if (!calendarResult.success) {
      console.error('Appointment assignment failed:', calendarResult.error)
      return NextResponse.json(
        { error: 'Failed to create calendar event', details: calendarResult.error },
        { status: 500 }
      )
    }

    // Send video session invitation email
    const emailResult = await googleWorkspaceService.sendVideoSessionInvitation({
      patientEmail: patientEmail,
      patientName: patientName,
      appointmentDate: startDateTime.toISOString(),
      appointmentTime: time,
      meetLink: calendarResult.meetLink,
      bookingId: calendarResult.bookingId,
      sessionType: sessionPackage?.name || 'Therapy Session',
      sessionNumber: 1,
      totalSessions: sessionsTotal,
      isFirstSession: true
    })

    if (!emailResult.success) {
      console.warn('Failed to send invitation email:', emailResult.error)
    }

    // The Google Calendar event already blocks the time
    // The availability will be automatically updated when fetchAvailability() is called
    // because it checks for existing bookings in Google Calendar

    return NextResponse.json({
      success: true,
      booking: {
        bookingId: calendarResult.bookingId,
        eventId: calendarResult.eventId,
        patientName: patientName,
        patientEmail: patientEmail,
        date: date,
        time: time,
        duration: duration,
        meetLink: calendarResult.meetLink,
        calendarLink: calendarResult.htmlLink
      }
    })

  } catch (error: any) {
    console.error('Appointment assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to assign appointment', details: error.message },
      { status: 500 }
    )
  }
}