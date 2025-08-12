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

export async function POST(request: NextRequest) {
  try {
    const { 
      patientName, 
      patientEmail, 
      patientPhone, 
      date, 
      time, 
      sessionType = "Single Session",
      notes = "" 
    } = await request.json()

    if (!patientName || !patientEmail || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await ensureFiles()

    // Check if slot is available
    const bookingsContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
    const existingBookings = bookingsContent.split('\n').slice(1)
    const slotTaken = existingBookings.some(line => {
      if (!line.trim()) return false
      const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),"(.+)",(.+)$/)
      if (match) {
        const [, , , bookingDate, bookingTime] = match
        return bookingDate === date && bookingTime === time
      }
      return false
    })

    if (slotTaken) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      )
    }

    // Generate IDs
    const bookingId = uuidv4()
    const bookingToken = uuidv4()
    const userId = `ADMIN-${Date.now()}`

    // Create medical form data for admin booking
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
      id: sessionType.toLowerCase().replace(' ', '-'),
      name: sessionType,
      price: sessionType.includes('4') ? 350 : sessionType.includes('6') ? 450 : 100,
      duration: "50 minutes"
    }

    // Add to booking-tokens.csv
    const tokenLine = `${bookingToken},${userId},"${JSON.stringify(medicalFormData).replace(/"/g, '""')}","${JSON.stringify(sessionPackage).replace(/"/g, '""')}",${new Date().toISOString()}\n`
    await fs.appendFile(BOOKING_TOKENS_FILE, tokenLine)

    // Add to bookings.csv
    const bookingLine = `${bookingId},${bookingToken},${date},${time},"${JSON.stringify(sessionPackage)}",${new Date().toISOString()}\n`
    await fs.appendFile(BOOKINGS_FILE, bookingLine)

    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Manual booking created successfully'
    })

  } catch (error) {
    console.error('Manual booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create manual booking' },
      { status: 500 }
    )
  }
}