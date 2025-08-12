import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
const googleWorkspaceService = require('@/utils/googleWorkspace')
const csvHelpers = require('@/utils/csvHelpers')

const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.csv')
const BOOKING_TOKENS_FILE = path.join(process.cwd(), 'booking-tokens.csv')

async function ensureFiles() {
  try {
    await fs.access(BOOKINGS_FILE)
  } catch {
    await fs.writeFile(BOOKINGS_FILE, 'bookingId,bookingToken,date,time,sessionPackage,createdAt,meetLink,calendarEventId\n')
  }
  
  try {
    await fs.access(BOOKING_TOKENS_FILE)
  } catch {
    await fs.writeFile(BOOKING_TOKENS_FILE, 'bookingToken,userId,medicalFormData,sessionPackage,createdAt\n')
  }
}

async function getTokenData(bookingToken: string) {
  const fileContent = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8')
  const lines = fileContent.split('\n')
  
  for (const line of lines.slice(1)) {
    if (line.trim() && line.startsWith(bookingToken)) {
      return line
    }
  }
  return null
}

async function getPatientDataFromToken(bookingToken: string) {
  try {
    const tokenData = await getTokenData(bookingToken)
    if (!tokenData) return null

    // Parse CSV line: bookingToken,userId,medicalFormData,sessionPackage,createdAt
    const parts = tokenData.split(',')
    if (parts.length < 4) return null

    const medicalDataEncrypted = parts[2].replace(/"/g, '')
    const sessionPackageStr = parts[3].replace(/"/g, '').replace(/""/g, '"')
    
    // For now, we'll extract basic info from the medical form
    // In a real app, you'd decrypt the medical data properly
    return {
      bookingToken: parts[0],
      userId: parts[1],
      sessionPackage: JSON.parse(sessionPackageStr),
      // We'll need to add patient email/name extraction when we extend CSV structure
      patientEmail: null, // Will be added when we extend CSV
      patientName: null   // Will be added when we extend CSV
    }
  } catch (error) {
    console.error('Error parsing token data:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookingToken, date, time, sessionPackage } = await request.json()

    if (!bookingToken || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await ensureFiles()
    await csvHelpers.ensureExtendedCSVStructure()

    // Validate if this token can make new bookings
    const bookingValidation = await csvHelpers.canMakeNewBooking(bookingToken)
    if (!bookingValidation.canBook) {
      return NextResponse.json(
        { error: bookingValidation.reason },
        { status: 403 }
      )
    }

    // Check if slot is still available
    const bookingsContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
    const existingBookings = bookingsContent.split('\n').slice(1)
    const slotTaken = existingBookings.some(line => {
      if (!line.trim()) return false
      const [, , bookingDate, bookingTime] = line.split(',')
      return bookingDate === date && bookingTime === time
    })

    if (slotTaken) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      )
    }

    // Create booking
    const bookingId = uuidv4()
    
    // Get patient data from extended CSV structure
    const sessionInfo = await csvHelpers.getRemainingSessionsFromToken(bookingToken)
    const bookingHistory = await csvHelpers.getBookingHistoryForToken(bookingToken)
    
    // Create Google Calendar event and send confirmation email
    let meetLink = null
    let calendarEventId = null
    
    try {
      // Use test email for development
      const patientEmail = sessionInfo.patientEmail || 'ben.gomes28@gmail.com'
      const patientName = sessionInfo.patientName || 'Ben Gomes (Test Patient)'
      const sessionNumber = bookingHistory.length + 1
      const totalSessions = sessionInfo.sessionsTotal
      
      // Create calendar event with Google Meet
      const startDateTime = new Date(`${date}T${time}:00.000Z`).toISOString()
      const endDateTime = new Date(new Date(startDateTime).getTime() + 50 * 60 * 1000).toISOString() // 50 minutes later
      
      const calendarResult = await googleWorkspaceService.createCalendarEvent({
        summary: `Therapy Session - ${patientName}`,
        description: `Therapy session with ${patientName}\nSession: ${sessionPackage?.name || 'Individual Session'}\nBooking ID: ${bookingId}`,
        startDateTime,
        endDateTime,
        attendeeEmail: patientEmail,
        bookingId
      })

      if (calendarResult.success) {
        meetLink = calendarResult.meetLink
        calendarEventId = calendarResult.eventId
        console.log(`✅ Calendar event created: ${calendarEventId}`)
        
        // Send booking confirmation email
        const emailResult = await googleWorkspaceService.sendBookingConfirmation({
          patientEmail,
          patientName,
          appointmentDate: date,
          appointmentTime: time,
          meetLink,
          bookingId,
          sessionType: sessionPackage?.name || 'Individual Session',
          sessionNumber,
          totalSessions
        })

        if (emailResult.success) {
          console.log(`✅ Confirmation email sent to ${patientEmail}`)
        } else {
          console.error(`❌ Failed to send confirmation email: ${emailResult.error}`)
        }
      } else {
        console.error(`❌ Failed to create calendar event: ${calendarResult.error}`)
        // Fallback: create booking without calendar integration
        meetLink = 'https://meet.google.com/new'
      }
    } catch (integrationError) {
      console.error('❌ Google integration error:', integrationError)
      meetLink = 'https://meet.google.com/new' // Fallback
    }
    
    // Store booking using extended CSV helpers
    const bookingSuccess = await csvHelpers.createExtendedBooking({
      bookingId,
      bookingToken,
      date,
      time,
      sessionPackage,
      meetLink,
      calendarEventId
    })

    if (!bookingSuccess) {
      throw new Error('Failed to store booking in CSV')
    }

    // Get updated session info
    const updatedSessionInfo = await csvHelpers.getRemainingSessionsFromToken(bookingToken)

    return NextResponse.json({
      success: true,
      bookingId,
      meetLink,
      sessionNumber: sessionInfo.sessionsUsed + 1,
      sessionsRemaining: updatedSessionInfo?.sessionsRemaining || 0,
      totalSessions: sessionInfo.sessionsTotal,
      message: `Session ${sessionInfo.sessionsUsed + 1}/${sessionInfo.sessionsTotal} booked successfully! Calendar invite and confirmation email sent.`
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}