import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { encryptData, decryptData } from '@/utils/encryption'

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

export async function POST(request: NextRequest) {
  try {
    const { bookingToken, notes } = await request.json()

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    // Read the booking tokens file
    const content = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8')
    const lines = content.split('\n')
    const header = lines[0]
    const dataLines = lines.slice(1).filter(line => line.trim())

    // Find and update the patient record
    let updated = false
    const updatedLines = dataLines.map(line => {
      const parts = parseCSVLine(line)
      
      if (parts[0] === bookingToken) {
        updated = true
        
        // Encrypt the notes if provided
        const encryptedNotes = notes ? encryptData(notes) : ''
        
        // Update the line with notes (assuming notes are in the 6th column, index 5)
        // CSV structure: bookingToken, userId, medicalData, sessionPackage, createdAt, therapistNotes
        if (parts.length === 5) {
          // Add notes column if it doesn't exist
          return `${parts[0]},${parts[1]},"${parts[2]}","${parts[3]}",${parts[4]},"${encryptedNotes}"`
        } else if (parts.length >= 6) {
          // Update existing notes column
          return `${parts[0]},${parts[1]},"${parts[2]}","${parts[3]}",${parts[4]},"${encryptedNotes}"`
        }
      }
      
      return line
    })

    if (!updated) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Write back to file
    const newContent = header + '\n' + updatedLines.join('\n') + '\n'
    await fs.writeFile(BOOKING_TOKENS_FILE, newContent)

    return NextResponse.json({
      success: true,
      message: 'Notes saved successfully'
    })

  } catch (error) {
    console.error('Therapist notes save error:', error)
    return NextResponse.json(
      { error: 'Failed to save notes' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingToken = searchParams.get('bookingToken')

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    // Read the booking tokens file
    const content = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8')
    const lines = content.split('\n').slice(1).filter(line => line.trim())

    // Find the patient record
    for (const line of lines) {
      const parts = parseCSVLine(line)
      
      if (parts[0] === bookingToken && parts.length >= 6 && parts[5]) {
        try {
          // Decrypt the notes
          const decryptedNotes = decryptData(parts[5])
          return NextResponse.json({
            success: true,
            notes: decryptedNotes
          })
        } catch (decryptError) {
          console.error('Notes decryption error:', decryptError)
          return NextResponse.json({
            success: true,
            notes: 'Error decrypting notes'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      notes: ''
    })

  } catch (error) {
    console.error('Therapist notes fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}