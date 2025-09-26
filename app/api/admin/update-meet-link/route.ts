import { NextRequest, NextResponse } from 'next/server'
const googleWorkspaceService = require('@/utils/google')

export async function POST(request: NextRequest) {
  try {
    const { eventId, meetLink } = await request.json()

    if (!eventId || !meetLink) {
      return NextResponse.json(
        { error: 'Missing eventId or meetLink' },
        { status: 400 }
      )
    }

    // Get the current event
    const event = await googleWorkspaceService.calendar.events.get({
      calendarId: 'dr.k@doctorktherapy.com',
      eventId: eventId
    })

    console.log('Current event found:', event.data.summary)

    // Update the event with the specified meet link
    const updatedEvent = {
      ...event.data,
      conferenceData: {
        entryPoints: [{
          entryPointType: 'video',
          uri: meetLink,
          label: 'Google Meet'
        }],
        conferenceSolution: {
          key: { type: 'hangoutsMeet' },
          name: 'Google Meet'
        }
      }
    }

    // Update the event
    const result = await googleWorkspaceService.calendar.events.update({
      calendarId: 'dr.k@doctorktherapy.com',
      eventId: eventId,
      resource: updatedEvent,
      conferenceDataVersion: 1
    })

    console.log('✅ Event updated successfully with meet link:', meetLink)

    return NextResponse.json({
      success: true,
      eventId: eventId,
      meetLink: meetLink,
      message: 'Calendar event updated with specified meet link'
    })

  } catch (error: any) {
    console.error('❌ Failed to update meet link:', error.message)
    return NextResponse.json(
      { error: 'Failed to update meet link', details: error.message },
      { status: 500 }
    )
  }
}