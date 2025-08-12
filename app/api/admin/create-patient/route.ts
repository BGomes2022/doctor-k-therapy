import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { encryptMedicalData } from '@/utils/encryption'

const BOOKING_TOKENS_FILE = path.join(process.cwd(), 'booking-tokens.csv')

export async function POST(request: Request) {
  try {
    const { bookingToken, userId, medicalFormData, sessionPackage } = await request.json()

    // Encrypt the medical form data
    const encryptedMedicalData = encryptMedicalData(medicalFormData)
    
    // Create CSV row
    const csvRow = [
      bookingToken,
      userId,
      `"${encryptedMedicalData}"`,
      `"${JSON.stringify(sessionPackage).replace(/"/g, '""')}"`,
      new Date().toISOString(),
      '' // empty therapist notes column
    ].join(',')

    // Check if file exists, if not create with header
    try {
      await fs.access(BOOKING_TOKENS_FILE)
    } catch {
      const header = 'bookingToken,userId,medicalFormData,sessionPackage,createdAt,therapistNotes\n'
      await fs.writeFile(BOOKING_TOKENS_FILE, header)
    }

    // Append the new patient data
    await fs.appendFile(BOOKING_TOKENS_FILE, csvRow + '\n')

    return NextResponse.json({ 
      success: true, 
      message: 'Patient created successfully',
      bookingToken,
      userId
    })

  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}