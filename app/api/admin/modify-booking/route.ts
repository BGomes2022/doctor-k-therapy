import { NextRequest, NextResponse } from 'next/server'
const googleWorkspaceService = require('@/utils/googleWorkspace')

export async function POST(request: NextRequest) {
  try {
    const { eventId, action, newDate, newTime, reason = "", message = "" } = await request.json()

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'Event ID and action required' },
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

    if (action === 'reschedule') {
      if (!newDate || !newTime) {
        return NextResponse.json(
          { error: 'New date and time required for rescheduling' },
          { status: 400 }
        )
      }

      // Get the existing event
      const existingEvent = await googleWorkspaceService.calendar.events.get({
        calendarId: process.env.DOCTOR_EMAIL,
        eventId: eventId
      })

      if (!existingEvent.data) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }

      // Parse new date and time
      const startDateTime = new Date(`${newDate}T${newTime}:00.000Z`)
      if (isNaN(startDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date or time format' },
          { status: 400 }
        )
      }

      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + 50)

      // Update the event
      const updatedEvent = await googleWorkspaceService.calendar.events.update({
        calendarId: process.env.DOCTOR_EMAIL,
        eventId: eventId,
        resource: {
          ...existingEvent.data,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'Europe/Zurich'
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Europe/Zurich'
          },
          description: existingEvent.data.description + `\n\nRescheduled: ${reason}`
        },
        sendUpdates: 'all' // Notify attendees
      })

      console.log('✅ Event rescheduled:', eventId)

      return NextResponse.json({
        success: true,
        message: 'Booking rescheduled successfully',
        event: {
          eventId: eventId,
          newDate: newDate,
          newTime: newTime,
          meetLink: updatedEvent.data.conferenceData?.entryPoints?.[0]?.uri
        }
      })

    } else if (action === 'cancel') {
      // Get the existing event for notification details
      const existingEvent = await googleWorkspaceService.calendar.events.get({
        calendarId: process.env.DOCTOR_EMAIL,
        eventId: eventId
      })

      // Delete the event
      await googleWorkspaceService.calendar.events.delete({
        calendarId: process.env.DOCTOR_EMAIL,
        eventId: eventId,
        sendUpdates: 'all' // Notify attendees
      })

      console.log('✅ Event cancelled:', eventId)

      // Send cancellation email if we have patient details
      if (existingEvent.data && existingEvent.data.extendedProperties?.private?.patientEmail) {
        const patientEmail = existingEvent.data.extendedProperties.private.patientEmail
        const patientName = existingEvent.data.extendedProperties.private.patientName
        
        // You could implement a cancellation email function here
        console.log(`📧 Should send cancellation email to ${patientEmail}`)
      }

      return NextResponse.json({
        success: true,
        message: 'Booking cancelled successfully'
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "reschedule" or "cancel"' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Modify booking error:', error)
    return NextResponse.json(
      { error: 'Failed to modify booking', details: error.message },
      { status: 500 }
    )
  }
}