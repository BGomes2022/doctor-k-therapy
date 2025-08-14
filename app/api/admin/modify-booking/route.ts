import { NextRequest, NextResponse } from 'next/server'
import { getAllPatients, updatePatientSessions } from '@/utils/jsonPatientStorage'
const googleWorkspaceService = require('@/utils/googleWorkspace')

// Helper function to credit session back to patient
async function creditSessionToPatient(bookingToken: string) {
  try {
    console.log(`💰 Crediting session back to patient: ${bookingToken}`)
    
    // Credit 1 session back (delta = -1 to reduce sessionsUsed)
    const result = await updatePatientSessions(bookingToken, -1)
    
    if (result.success) {
      console.log(`✅ Session successfully credited back to ${bookingToken}`)
      return true
    } else {
      console.error(`❌ Failed to credit session: ${result.error}`)
      return false
    }
  } catch (error) {
    console.error('❌ Error crediting session:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, action, newDate, newTime, reason = "", message = "", bookingToken = "" } = await request.json()

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

      if (!existingEvent.data) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }

      // Extract patient details from event
      const patientEmail = existingEvent.data.extendedProperties?.private?.patientEmail
      const patientName = existingEvent.data.extendedProperties?.private?.patientName
      const eventBookingToken = existingEvent.data.extendedProperties?.private?.bookingToken || bookingToken

      // Credit session back to patient BEFORE deleting event
      if (eventBookingToken) {
        const creditSuccess = await creditSessionToPatient(eventBookingToken)
        if (!creditSuccess) {
          console.warn('⚠️ Failed to credit session, but continuing with cancellation')
        }
      }

      // Delete the event
      await googleWorkspaceService.calendar.events.delete({
        calendarId: process.env.DOCTOR_EMAIL,
        eventId: eventId,
        sendUpdates: 'all' // Notify attendees via Google Calendar
      })

      console.log('✅ Event cancelled:', eventId)

      // Send enhanced cancellation email with alternatives
      if (patientEmail && patientName) {
        try {
          const emailResult = await googleWorkspaceService.sendCancellationEmail({
            patientEmail,
            patientName,
            bookingToken: eventBookingToken,
            originalDate: existingEvent.data.start?.dateTime ? new Date(existingEvent.data.start.dateTime).toLocaleDateString() : 'Unknown',
            originalTime: existingEvent.data.start?.dateTime ? new Date(existingEvent.data.start.dateTime).toLocaleTimeString() : 'Unknown',
            reason: reason || 'Schedule conflict',
            message: message || 'I apologize for any inconvenience this may cause.',
            alternativeDate: newDate,
            alternativeTime: newTime
          })
          
          if (emailResult.success) {
            console.log(`✅ Cancellation email sent to ${patientEmail}`)
          } else {
            console.error(`❌ Failed to send cancellation email: ${emailResult.error}`)
          }
        } catch (emailError) {
          console.error('❌ Error sending cancellation email:', emailError)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Booking cancelled successfully and session credited back to patient',
        sessionCredited: !!eventBookingToken
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