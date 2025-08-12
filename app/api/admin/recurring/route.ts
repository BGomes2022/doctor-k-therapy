import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.csv')
const BOOKING_TOKENS_FILE = path.join(process.cwd(), 'booking-tokens.csv')

async function ensureFiles() {
  try {
    await fs.access(BOOKINGS_FILE)
  } catch {
    await fs.writeFile(BOOKINGS_FILE, 'bookingId,bookingToken,date,time,sessionPackage,createdAt\n')
  }
  
  try {
    await fs.access(BOOKING_TOKENS_FILE)
  } catch {
    await fs.writeFile(BOOKING_TOKENS_FILE, 'bookingToken,userId,medicalFormData,sessionPackage,createdAt\n')
  }
}

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + (weeks * 7))
  return result
}

function parseCSVLine(line: string): string[] {
  const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),"(.+)",(.+)$/)
  if (match) {
    return [match[1], match[2], match[3], match[4], match[5], match[6]]
  }
  return line.split(',')
}

export async function POST(request: NextRequest) {
  try {
    const { 
      patientName, 
      patientEmail, 
      patientPhone, 
      startDate, 
      time, 
      sessionType = "Single Session",
      frequency = "weekly", // weekly, biweekly, monthly
      duration = 6, // number of sessions
      notes = "" 
    } = await request.json()

    if (!patientName || !patientEmail || !startDate || !time || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await ensureFiles()

    // Check for conflicts with existing bookings
    const bookingsContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
    const existingBookings = bookingsContent.split('\n').slice(1)
    
    const dates = []
    const conflicts = []
    let currentDate = new Date(startDate)
    
    // Generate dates based on frequency
    for (let i = 0; i < duration; i++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dates.push(dateStr)
      
      // Check for conflicts
      const isConflicted = existingBookings.some(line => {
        if (!line.trim()) return false
        const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),"(.+)",(.+)$/)
        if (match) {
          const [, , , bookingDate, bookingTime] = match
          return bookingDate === dateStr && bookingTime === time
        }
        return false
      })
      
      if (isConflicted) {
        conflicts.push(dateStr)
      }
      
      // Move to next occurrence
      if (frequency === 'weekly') {
        currentDate = addWeeks(currentDate, 1)
      } else if (frequency === 'biweekly') {
        currentDate = addWeeks(currentDate, 2)
      } else if (frequency === 'monthly') {
        currentDate = addWeeks(currentDate, 4)
      }
    }

    if (conflicts.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some time slots are already booked', 
          conflicts: conflicts 
        },
        { status: 409 }
      )
    }

    // Generate shared booking token and medical data for all sessions
    const sharedBookingToken = uuidv4()
    const userId = `RECURRING-${Date.now()}`

    const medicalFormData = {
      fullName: patientName,
      email: patientEmail,
      phone: patientPhone || '',
      dateOfBirth: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      doctorName: '',
      doctorPhone: '',
      currentMedications: '',
      allergies: '',
      medicalConditions: '',
      currentProblems: notes,
      therapyHistory: '',
      therapyGoals: '',
      suicidalThoughts: '',
      substanceUse: '',
      dataConsent: true,
      treatmentConsent: true
    }

    const sessionPackage = {
      id: 'recurring-sessions',
      name: `Recurring ${sessionType} (${duration} sessions)`,
      price: duration * (sessionType.includes('Couples') ? 120 : 100),
      duration: "50 minutes",
      recurring: true,
      totalSessions: duration
    }

    // Add patient data once
    const tokenLine = `${sharedBookingToken},${userId},"${JSON.stringify(medicalFormData).replace(/"/g, '""')}","${JSON.stringify(sessionPackage).replace(/"/g, '""')}",${new Date().toISOString()}\n`
    await fs.appendFile(BOOKING_TOKENS_FILE, tokenLine)

    // Create all booking entries
    const bookingIds = []
    for (const dateStr of dates) {
      const bookingId = uuidv4()
      bookingIds.push(bookingId)
      
      const bookingLine = `${bookingId},${sharedBookingToken},${dateStr},${time},"${JSON.stringify(sessionPackage)}",${new Date().toISOString()}\n`
      await fs.appendFile(BOOKINGS_FILE, bookingLine)
    }

    return NextResponse.json({
      success: true,
      bookingIds,
      sharedBookingToken,
      totalSessions: duration,
      dates: dates,
      message: `Successfully created ${duration} recurring appointments`
    })

  } catch (error) {
    console.error('Recurring booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring bookings' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingToken = searchParams.get('bookingToken')
    const fromDate = searchParams.get('fromDate') // Optional: cancel from specific date onwards

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token required' },
        { status: 400 }
      )
    }

    await ensureFiles()

    // Read bookings file
    const bookingsContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
    const lines = bookingsContent.split('\n')
    const header = lines[0]
    const bookingLines = lines.slice(1).filter(line => line.trim())

    // Filter out bookings to cancel
    const filteredLines = bookingLines.filter(line => {
      const [, lineBookingToken, lineDate] = parseCSVLine(line)
      
      if (lineBookingToken !== bookingToken) {
        return true // Keep different booking tokens
      }
      
      if (fromDate) {
        // Only cancel bookings from the specified date onwards
        return new Date(lineDate) < new Date(fromDate)
      }
      
      // Cancel all bookings with this token
      return false
    })

    const newContent = header + '\n' + filteredLines.join('\n') + '\n'
    await fs.writeFile(BOOKINGS_FILE, newContent)

    const cancelledCount = bookingLines.length - filteredLines.length
    const message = fromDate 
      ? `Cancelled ${cancelledCount} recurring appointments from ${fromDate} onwards`
      : `Cancelled all ${cancelledCount} recurring appointments`

    return NextResponse.json({
      success: true,
      cancelledCount,
      message
    })

  } catch (error) {
    console.error('Recurring booking cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel recurring bookings' },
      { status: 500 }
    )
  }
}