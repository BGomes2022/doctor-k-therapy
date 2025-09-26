import { NextRequest, NextResponse } from 'next/server'
const googleWorkspaceService = require('@/utils/google')

// New Google Calendar-only availability management
// Working hours: Tuesday & Thursday 9:00-17:00 Portuguese Time (UTC+1)
// 50-minute sessions with 10-minute breaks = 1-hour slots

export async function GET() {
  try {
    // Get availability from Google Calendar events
    const availabilityResult = await googleWorkspaceService.getAvailabilityFromCalendar()
    
    if (!availabilityResult.success) {
      throw new Error(availabilityResult.error)
    }

    return NextResponse.json({
      success: true,
      availability: availabilityResult.availability
    })
  } catch (error) {
    console.error('Error getting availability:', error)
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, date, time, hours, reason = "", recurring = false } = await request.json()
    
    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 })
    }

    let result;

    switch (action) {
      case 'block_slot':
        // Block specific hour slot
        result = await googleWorkspaceService.blockTimeSlot({
          date,
          startTime: time,
          duration: hours || 1,
          reason: reason || 'Blocked',
          recurring
        })
        break;

      case 'unblock_slot':
        // Remove block for specific slot
        result = await googleWorkspaceService.unblockTimeSlot({ date, time })
        break;

      case 'block_day':
        // Block entire working day (9-17)
        result = await googleWorkspaceService.blockEntireDay({ date, reason })
        break;

      case 'block_vacation':
        // Block multiple days
        const { startDate, endDate } = await request.json()
        result = await googleWorkspaceService.blockVacation({ startDate, endDate, reason })
        break;

      case 'add_extra_slot':
        // Add availability outside normal hours
        result = await googleWorkspaceService.addExtraTimeSlot({ date, time, reason })
        break;

      case 'modify_working_day':
        // Change working hours for specific day
        const { newStartTime, newEndTime } = await request.json()
        result = await googleWorkspaceService.modifyWorkingDay({ 
          date, 
          startTime: newStartTime, 
          endTime: newEndTime 
        })
        break;

      case 'make_available':
        // Create availability slot (opposite of blocking)
        result = await googleWorkspaceService.addAvailabilitySlot({
          date,
          startTime: time,
          duration: hours || 0.5,
          reason: reason || 'Available for booking'
        })
        break;

      case 'make_unavailable':
        // Remove availability slot
        result = await googleWorkspaceService.removeAvailabilitySlot({ date, time })
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Action ${action} completed successfully`,
        eventId: result.eventId 
      })
    } else {
      throw new Error(result.error)
    }

  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}