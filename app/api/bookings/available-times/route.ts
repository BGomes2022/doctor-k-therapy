import { NextRequest, NextResponse } from 'next/server'
const googleWorkspaceService = require('@/utils/googleWorkspace')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default to next 4 weeks if no dates provided
    const now = new Date()
    const defaultStart = now.toISOString().split('T')[0]
    const defaultEndDate = new Date(now)
    defaultEndDate.setDate(defaultEndDate.getDate() + 28) // 4 weeks
    const defaultEnd = defaultEndDate.toISOString().split('T')[0]

    const queryStartDate = startDate || defaultStart
    const queryEndDate = endDate || defaultEnd

    // Convert to full ISO strings for API
    const startISO = new Date(`${queryStartDate}T00:00:00.000Z`).toISOString()
    const endISO = new Date(`${queryEndDate}T23:59:59.999Z`).toISOString()

    // Get available slots from Google Calendar
    const result = await googleWorkspaceService.getAvailableTimeSlots(startISO, endISO)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch available times', details: result.error },
        { status: 500 }
      )
    }

    // Group slots by date for easier frontend consumption
    const slotsByDate = result.slots.reduce((acc: any, slot: any) => {
      const date = slot.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push({
        time: slot.time,
        start: slot.start,
        end: slot.end
      })
      return acc
    }, {})

    // Format response
    const availableDates = Object.keys(slotsByDate).map(date => ({
      date,
      dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      slots: slotsByDate[date].sort((a: any, b: any) => a.time.localeCompare(b.time))
    })).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      success: true,
      dateRange: {
        start: queryStartDate,
        end: queryEndDate
      },
      availableDates: availableDates,
      totalSlots: result.slots.length
    })

  } catch (error: any) {
    console.error('Available times API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookingToken, sessionType, startDate, endDate } = await request.json()

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    // Get session info from token to determine duration
    const sessionInfo = await googleWorkspaceService.getSessionInfoFromBookingToken(bookingToken)
    
    console.log('🔍 Session Info from Token:', sessionInfo?.sessionPackage)
    
    // Determine block duration based on session package type  
    const sessionPackageType = sessionInfo?.sessionPackage?.sessionType || 'therapy'
    const blockDuration = sessionPackageType === 'consultation' ? 30 : 60 // minutes
    
    console.log(`⏱️ Session Type: ${sessionPackageType}, Block Duration: ${blockDuration} min`)
    
    // Use provided dates or default to 4 weeks
    const now = new Date()
    const queryStartDate = startDate || now.toISOString().split('T')[0]
    const queryEndDate = endDate || new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const startISO = new Date(`${queryStartDate}T00:00:00.000Z`).toISOString()
    const endISO = new Date(`${queryEndDate}T23:59:59.999Z`).toISOString()

    const result = await googleWorkspaceService.getAvailableTimeSlots(startISO, endISO)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch available times', details: result.error },
        { status: 500 }
      )
    }

    console.log(`📊 Found ${result.slots.length} total available slots`)
    
    // Filter slots based on required duration
    // For each slot, check if the next required duration is also available
    const filteredSlots = result.slots.filter((slot: any, index: number) => {
      const slotTime = new Date(`${slot.date}T${slot.time}:00`)
      const endTime = new Date(slotTime.getTime() + blockDuration * 60 * 1000)
      
      // Check if we have enough consecutive available slots
      if (blockDuration === 30) {
        // For 30-min consultation, just need this slot
        return true
      } else {
        // For 60-min session, need this slot AND the next 30-min slot
        const nextSlotTime = `${slotTime.getHours().toString().padStart(2, '0')}:30`
        const nextSlotExists = result.slots.some((s: any) => 
          s.date === slot.date && s.time === nextSlotTime && s.available
        )
        
        // Only show slots on the hour if next 30-min is also available
        return slot.time.endsWith(':00') && (nextSlotExists || 
          // Or check if the full hour is within available time
          result.slots.some((s: any) => {
            const sTime = new Date(`${s.date}T${s.time}:00`)
            return sTime.getTime() === slotTime.getTime() + 30 * 60 * 1000
          })
        )
      }
    })

    // Group filtered slots by date
    const slotsByDate = filteredSlots.reduce((acc: any, slot: any) => {
      const date = slot.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push({
        time: slot.time,
        start: slot.start,
        end: slot.end
      })
      return acc
    }, {})

    const availableDates = Object.keys(slotsByDate).map(date => ({
      date,
      dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      slots: slotsByDate[date].sort((a: any, b: any) => a.time.localeCompare(b.time))
    })).sort((a, b) => a.date.localeCompare(b.date))

    console.log(`✅ Filtered to ${filteredSlots.length} bookable slots for ${sessionPackageType}`)

    return NextResponse.json({
      success: true,
      availableDates: availableDates,
      totalSlots: filteredSlots.length,
      sessionType: sessionPackageType,
      blockDuration: blockDuration
    })

  } catch (error: any) {
    console.error('Available times POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}