import { NextRequest, NextResponse } from 'next/server'
const googleWorkspaceService = require('@/utils/google')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const adminMode = searchParams.get('adminMode') === 'true' // Admin mode flag

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

    // Get available slots - disable intelligent filtering for admin mode
    const result = await googleWorkspaceService.getAvailableTimeSlots(startISO, endISO, !adminMode)

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
    // First try to get from Google Calendar
    let sessionInfo = await googleWorkspaceService.getSessionInfoFromBookingToken(bookingToken)

    // If not found in calendar, get from patients.json
    if (!sessionInfo) {
      const fs = require('fs/promises')
      const path = require('path')
      const patientsPath = path.join(process.cwd(), 'data', 'patients.json')

      try {
        const patientsData = await fs.readFile(patientsPath, 'utf-8')
        const patients = JSON.parse(patientsData)
        const patient = patients.find((p: any) => p.bookingToken === bookingToken)

        if (patient && patient.sessionInfo) {
          // Check if it's a single-session package
          const isSingleSession = patient.sessionInfo.packageId === 'single-session'
          sessionInfo = {
            sessionPackage: {
              name: patient.sessionInfo.packageName,
              price: patient.sessionInfo.price,
              // single-session is a therapy session (60 min), not consultation
              sessionType: patient.sessionInfo.packageId === 'consultation' ? 'consultation' : 'therapy'
            },
            totalSessions: patient.sessionInfo.sessionsTotal,
            sessionsUsed: patient.sessionInfo.sessionsUsed
          }
          console.log(`📝 Found patient info for ${patient.basicInfo.fullName}: ${patient.sessionInfo.packageName}`)
        }
      } catch (error) {
        console.error('Error reading patients data:', error)
      }
    }

    console.log('🔍 Session Info:', sessionInfo?.sessionPackage)

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

    // Get ALL available slots without intelligent filtering (we'll filter them here based on session type)
    const result = await googleWorkspaceService.getAvailableTimeSlots(startISO, endISO, false)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch available times', details: result.error },
        { status: 500 }
      )
    }

    console.log(`📊 Found ${result.slots.length} total available slots`)
    if (result.slots.length > 0) {
      console.log(`🔍 DEBUG - First raw slot:`, result.slots[0])
      console.log(`🔍 DEBUG - Has available property:`, result.slots[0].available)
      console.log(`🔍 DEBUG - Has eventType:`, result.slots[0].eventType)
    } else {
      console.log(`🔍 DEBUG - NO SLOTS FOUND!`)
    }

    // TEMPORARY: Skip intelligent filtering for debugging
    const intelligentSlots = result.slots.map(slot => ({
      ...slot,
      canAccommodateTherapy: true,
      canAccommodateConsultation: true
    }))
    // const intelligentSlots = googleWorkspaceService.applyIntelligentSlotFiltering(result.slots)

    console.log(`🔍 After intelligent filtering: ${intelligentSlots.length} slots`)
    console.log(`🔍 DEBUG - First 3 intelligent slots:`, intelligentSlots.slice(0, 3))

    // Filter slots based on session type using the new intelligent filtering
    const filteredSlots = intelligentSlots.filter((slot: any) => {
      if (sessionPackageType === 'consultation') {
        // For consultations (30min), check if slot can accommodate consultation
        const canBook = slot.canAccommodateConsultation !== false
        if (!canBook) {
          console.log(`❌ Slot rejected for consultation: ${slot.date} ${slot.time} - canAccommodateConsultation: ${slot.canAccommodateConsultation}`)
        }
        return canBook
      } else {
        // For therapy (50min), check if slot can accommodate therapy session
        return slot.canAccommodateTherapy !== false
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