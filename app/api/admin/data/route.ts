import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { decryptMedicalData, decryptData } from '@/utils/encryption'

const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.csv')
const BOOKING_TOKENS_FILE = path.join(process.cwd(), 'booking-tokens.csv')

function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

export async function GET() {
  try {
    // Read bookings
    let bookings = []
    try {
      const bookingsContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
      const bookingLines = bookingsContent.split('\n').slice(1) // Skip header
      
      bookings = bookingLines
        .filter(line => line.trim())
        .map(line => {
          console.log('Processing booking line:', line)
          // Use regex to extract quoted JSON
          const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),"(.+)",(.+)$/)
          
          if (match) {
            const [, bookingId, bookingToken, date, time, sessionPackageStr, createdAt] = match
            
            let sessionPackage = {}
            try {
              sessionPackage = JSON.parse(sessionPackageStr)
            } catch (e) {
              sessionPackage = { name: "Session Package", price: 100 }
            }
            
            const booking = {
              bookingId,
              bookingToken,
              date,
              time,
              sessionPackage,
              createdAt
            }
            console.log('Parsed booking:', booking)
            return booking
          } else {
            console.error('Could not parse booking line:', line)
            return null
          }
        })
        .filter(booking => booking !== null)
      
      console.log('Total bookings found:', bookings.length)
    } catch (error) {
      console.error('Error reading bookings file:', error)
    }

    // Read patient data
    let patients = []
    try {
      const patientsContent = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8')
      const patientLines = patientsContent.split('\n').slice(1) // Skip header
      
      patients = patientLines
        .filter(line => line.trim())
        .map(line => {
          const parts = parseCSVLine(line)
          const [bookingToken, userId, encryptedMedicalData, sessionPackage, createdAt] = parts
          const encryptedNotes = parts[5] || '' // 6th column for therapist notes
          
          let medicalFormData = {}
          let therapistNotes = ''
          
          try {
            if (encryptedMedicalData) {
              // Check if data looks encrypted (contains ':' which indicates our encryption format)
              if (encryptedMedicalData.includes(':') && encryptedMedicalData.split(':').length === 3) {
                // Data is encrypted
                medicalFormData = decryptMedicalData(encryptedMedicalData)
              } else {
                // Data is unencrypted JSON (backwards compatibility)
                medicalFormData = JSON.parse(encryptedMedicalData)
              }
            }
          } catch (error) {
            console.error('Error processing medical data:', error)
            // Try one more time as plain JSON
            try {
              medicalFormData = JSON.parse(encryptedMedicalData || '{}')
            } catch (parseError) {
              console.error('Failed to parse as JSON:', parseError)
              medicalFormData = { 
                fullName: 'Data Processing Error',
                email: 'Could not read patient data',
                error: true 
              }
            }
          }

          // Try to decrypt therapist notes
          try {
            if (encryptedNotes && encryptedNotes.includes(':')) {
              therapistNotes = decryptData(encryptedNotes)
            }
          } catch (notesDecryptError) {
            console.error('Error decrypting therapist notes:', notesDecryptError)
            therapistNotes = 'Error decrypting notes'
          }
          
          return {
            bookingToken,
            userId,
            medicalFormData,
            sessionPackage: sessionPackage ? JSON.parse(sessionPackage) : {},
            createdAt,
            therapistNotes
          }
        })
    } catch (error) {
      console.error('Error reading patients file:', error)
    }

    // Combine data
    const enhancedBookings = bookings.map(booking => {
      const patient = patients.find(p => p.bookingToken === booking.bookingToken)
      return {
        ...booking,
        medicalData: patient?.medicalFormData
      }
    })

    console.log('Sending response - bookings:', enhancedBookings.length)
    console.log('Sending response - patients:', patients.length)

    return NextResponse.json({
      success: true,
      bookings: enhancedBookings,
      patients
    })

  } catch (error) {
    console.error('Error reading admin data:', error)
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    )
  }
}