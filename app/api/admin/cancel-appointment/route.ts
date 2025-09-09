import { NextRequest, NextResponse } from 'next/server'
const googleWorkspaceService = require('@/utils/googleWorkspace')

export async function POST(request: NextRequest) {
  try {
    const { 
      bookingId,
      eventId,
      patientName, 
      patientEmail, 
      date, 
      time
    } = await request.json()

    // Validate required fields
    if (!patientName || !patientEmail || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Delete the Google Calendar event
    if (eventId) {
      try {
        const deleteResult = await googleWorkspaceService.deleteCalendarEvent(eventId)
        if (!deleteResult.success) {
          console.warn('Failed to delete calendar event:', deleteResult.error)
        }
      } catch (error) {
        console.warn('Error deleting calendar event:', error)
      }
    }

    // Send cancellation notification email
    const emailResult = await googleWorkspaceService.sendCancellationEmail({
      patientEmail: patientEmail,
      patientName: patientName,
      appointmentDate: date,
      appointmentTime: time,
      reason: 'Cancelled by admin'
    })

    if (!emailResult.success) {
      console.warn('Failed to send cancellation email:', emailResult.error)
    }

    return NextResponse.json({
      success: true,
      message: `Appointment cancelled for ${patientName}`,
      emailSent: emailResult.success
    })

  } catch (error: any) {
    console.error('Appointment cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel appointment', details: error.message },
      { status: 500 }
    )
  }
}