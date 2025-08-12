import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { decryptMedicalData } from '@/utils/encryption'

const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.csv')
const BOOKING_TOKENS_FILE = path.join(process.cwd(), 'booking-tokens.csv')
const GDPR_LOG_FILE = path.join(process.cwd(), 'gdpr-deletion-log.csv')

// Initialize GDPR log file
async function ensureGDPRLogFile() {
  try {
    await fs.access(GDPR_LOG_FILE)
  } catch {
    await fs.writeFile(GDPR_LOG_FILE, 'timestamp,requestId,email,action,status,reason\n')
  }
}

// Log GDPR actions for compliance
async function logGDPRAction(email: string, action: string, status: string, reason: string = '') {
  await ensureGDPRLogFile()
  const requestId = crypto.randomUUID()
  const timestamp = new Date().toISOString()
  const logEntry = `${timestamp},${requestId},"${email}","${action}","${status}","${reason}"\n`
  await fs.appendFile(GDPR_LOG_FILE, logEntry)
  return requestId
}

// Parse CSV lines properly
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

// Check if data can be deleted (considering legal retention periods)
function canDeleteMedicalData(createdAt: string): { canDelete: boolean, reason: string } {
  const createdDate = new Date(createdAt)
  const now = new Date()
  const yearsDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  
  if (yearsDiff < 10) {
    return {
      canDelete: false,
      reason: `Medizinische Daten müssen gemäß § 630f BGB 10 Jahre aufbewahrt werden. Löschung möglich ab: ${new Date(createdDate.getTime() + 10 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}`
    }
  }
  
  return { canDelete: true, reason: 'Aufbewahrungsfrist abgelaufen' }
}

export async function POST(request: NextRequest) {
  try {
    const { email, requestType = 'deletion' } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      await logGDPRAction(email, requestType, 'REJECTED', 'Invalid email format')
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      )
    }

    const results = {
      foundData: false,
      deletedBookings: 0,
      deletedTokens: 0,
      medicalDataStatus: 'none',
      retentionInfo: '',
      requestId: ''
    }

    // Check booking tokens file for user data
    try {
      const tokensContent = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8')
      const tokenLines = tokensContent.split('\n').slice(1).filter(line => line.trim())
      
      let foundTokens = []
      let remainingTokens = []
      
      for (const line of tokenLines) {
        const parts = parseCSVLine(line)
        if (parts.length >= 3) {
          try {
            // Try to decrypt medical data
            let medicalData = {}
            if (parts[2] && parts[2].includes(':')) {
              // Data is encrypted
              medicalData = decryptMedicalData(parts[2])
            } else if (parts[2]) {
              // Fallback: unencrypted JSON
              medicalData = JSON.parse(parts[2])
            }
            if (medicalData.email === email) {
              foundTokens.push({
                line,
                parts,
                medicalData,
                createdAt: parts[4] || new Date().toISOString()
              })
              results.foundData = true
            } else {
              remainingTokens.push(line)
            }
          } catch (parseError) {
            remainingTokens.push(line) // Keep unparseable lines
          }
        } else {
          remainingTokens.push(line)
        }
      }

      if (foundTokens.length > 0) {
        // Check if medical data can be deleted
        const oldestRecord = foundTokens.reduce((oldest, current) => 
          new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
        )
        
        const deletionCheck = canDeleteMedicalData(oldestRecord.createdAt)
        
        if (deletionCheck.canDelete) {
          // Delete the tokens (medical data)
          const tokensHeader = tokensContent.split('\n')[0]
          const newTokensContent = tokensHeader + '\n' + remainingTokens.join('\n') + '\n'
          await fs.writeFile(BOOKING_TOKENS_FILE, newTokensContent)
          
          results.deletedTokens = foundTokens.length
          results.medicalDataStatus = 'deleted'
          
          // Also delete associated bookings
          const bookingsContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
          const bookingLines = bookingsContent.split('\n')
          const bookingsHeader = bookingLines[0]
          const bookingDataLines = bookingLines.slice(1).filter(line => line.trim())
          
          const tokenIds = foundTokens.map(t => t.parts[0])
          const remainingBookings = bookingDataLines.filter(line => {
            const [, bookingToken] = parseCSVLine(line)
            return !tokenIds.includes(bookingToken)
          })
          
          const newBookingsContent = bookingsHeader + '\n' + remainingBookings.join('\n') + '\n'
          await fs.writeFile(BOOKINGS_FILE, newBookingsContent)
          
          results.deletedBookings = bookingDataLines.length - remainingBookings.length
          
        } else {
          results.medicalDataStatus = 'retention_period'
          results.retentionInfo = deletionCheck.reason
        }
      }

    } catch (error) {
      console.error('Error processing deletion request:', error)
    }

    // Log the GDPR action
    results.requestId = await logGDPRAction(
      email, 
      requestType, 
      results.foundData ? (results.medicalDataStatus === 'deleted' ? 'COMPLETED' : 'PARTIAL') : 'NO_DATA_FOUND',
      results.retentionInfo
    )

    if (!results.foundData) {
      return NextResponse.json({
        success: true,
        message: 'Keine Daten zu dieser E-Mail-Adresse gefunden.',
        requestId: results.requestId,
        details: results
      })
    }

    return NextResponse.json({
      success: true,
      message: results.medicalDataStatus === 'deleted' 
        ? 'Alle Ihre Daten wurden erfolgreich gelöscht.'
        : 'Ihre Daten befinden sich noch in der gesetzlichen Aufbewahrungsfrist.',
      requestId: results.requestId,
      details: results
    })

  } catch (error) {
    console.error('GDPR deletion error:', error)
    
    // Log failed attempt
    if (request.json) {
      try {
        const { email } = await request.json()
        await logGDPRAction(email || 'unknown', 'deletion', 'ERROR', error.message)
      } catch {}
    }
    
    return NextResponse.json(
      { error: 'Fehler bei der Datenverarbeitung' },
      { status: 500 }
    )
  }
}

// GET endpoint for data export (Art. 20 DSGVO - Data Portability)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      )
    }

    const exportData = {
      requestDate: new Date().toISOString(),
      email: email,
      personalData: null,
      bookings: [],
      medicalData: null
    }

    // Find user data in booking tokens
    try {
      const tokensContent = await fs.readFile(BOOKING_TOKENS_FILE, 'utf-8')
      const tokenLines = tokensContent.split('\n').slice(1).filter(line => line.trim())
      
      for (const line of tokenLines) {
        const parts = parseCSVLine(line)
        if (parts.length >= 3) {
          try {
            // Try to decrypt medical data
            let medicalData = {}
            if (parts[2] && parts[2].includes(':')) {
              // Data is encrypted
              medicalData = decryptMedicalData(parts[2])
            } else if (parts[2]) {
              // Fallback: unencrypted JSON
              medicalData = JSON.parse(parts[2])
            }
            if (medicalData.email === email) {
              exportData.personalData = {
                fullName: medicalData.fullName,
                email: medicalData.email,
                phone: medicalData.phone,
                createdAt: parts[4]
              }
              exportData.medicalData = medicalData
              
              // Find associated bookings
              const bookingsContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
              const bookingLines = bookingsContent.split('\n').slice(1).filter(line => line.trim())
              
              for (const bookingLine of bookingLines) {
                const [bookingId, bookingToken, date, time, sessionPackage, createdAt] = parseCSVLine(bookingLine)
                if (bookingToken === parts[0]) {
                  exportData.bookings.push({
                    bookingId,
                    date,
                    time,
                    sessionPackage: JSON.parse(sessionPackage),
                    createdAt
                  })
                }
              }
              break
            }
          } catch (parseError) {
            continue
          }
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }

    // Log data export request
    await logGDPRAction(email, 'data_export', exportData.personalData ? 'COMPLETED' : 'NO_DATA_FOUND')

    return NextResponse.json({
      success: true,
      data: exportData,
      message: exportData.personalData 
        ? 'Ihre Daten wurden erfolgreich exportiert.'
        : 'Keine Daten zu dieser E-Mail-Adresse gefunden.'
    })

  } catch (error) {
    console.error('GDPR export error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Datenexport' },
      { status: 500 }
    )
  }
}