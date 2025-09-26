import { NextRequest, NextResponse } from 'next/server'
const googleWorkspaceService = require('@/utils/google')

export async function POST(request: NextRequest) {
  try {
    const { bookingToken, alternativeDate, alternativeTime, patientEmail, patientName } = await request.json()

    if (!bookingToken || !alternativeDate || !alternativeTime || !patientEmail) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 }
      )
    }

    // Initialize Google Calendar
    if (!googleWorkspaceService.calendar) {
      const authSuccess = await googleWorkspaceService.authenticate()
      if (!authSuccess) {
        return NextResponse.json(
          { error: 'Failed to authenticate with Google Calendar' },
          { status: 500 }
        )
      }
    }

    // Create new appointment for the confirmed alternative time
    const startDateTime = new Date(`${alternativeDate}T${alternativeTime}:00.000Z`)
    if (isNaN(startDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      )
    }

    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + 50) // 50 minute session

    // Create the new calendar event
    const event = {
      summary: `💬 Therapy Session - ${patientName}`,
      description: `
Therapy Session
Patient: ${patientName}
Email: ${patientEmail}
Booking Token: ${bookingToken}

Rescheduled appointment (patient confirmed alternative time)
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Zurich'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Zurich'
      },
      attendees: [
        { email: patientEmail, displayName: patientName }
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${bookingToken}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      extendedProperties: {
        private: {
          bookingToken: bookingToken,
          therapySession: 'true',
          patientEmail: patientEmail,
          patientName: patientName,
          rescheduled: 'true'
        }
      }
    }

    const createdEvent = await googleWorkspaceService.calendar.events.insert({
      calendarId: process.env.DOCTOR_EMAIL,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all' // Send invites to attendees
    })

    console.log('✅ Alternative appointment confirmed and created:', createdEvent.data.id)

    return NextResponse.json({
      success: true,
      message: 'Alternative appointment confirmed successfully',
      event: {
        eventId: createdEvent.data.id,
        date: alternativeDate,
        time: alternativeTime,
        meetLink: createdEvent.data.conferenceData?.entryPoints?.[0]?.uri
      }
    })

  } catch (error: any) {
    console.error('Confirm alternative error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm alternative appointment', details: error.message },
      { status: 500 }
    )
  }
}