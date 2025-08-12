import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

const WAITLIST_FILE = path.join(process.cwd(), 'waitlist.csv')

async function ensureWaitlistFile() {
  try {
    await fs.access(WAITLIST_FILE)
  } catch {
    await fs.writeFile(WAITLIST_FILE, 'waitlistId,patientName,patientEmail,patientPhone,preferredDates,preferredTimes,sessionType,priority,status,createdAt,notes\n')
  }
}

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
    await ensureWaitlistFile()
    const content = await fs.readFile(WAITLIST_FILE, 'utf-8')
    const lines = content.split('\n').slice(1).filter(line => line.trim())
    
    const waitlist = lines.map(line => {
      const [
        waitlistId, patientName, patientEmail, patientPhone, 
        preferredDates, preferredTimes, sessionType, priority, 
        status, createdAt, notes
      ] = parseCSVLine(line)
      
      return {
        waitlistId,
        patientName,
        patientEmail,
        patientPhone,
        preferredDates: preferredDates ? JSON.parse(preferredDates) : [],
        preferredTimes: preferredTimes ? JSON.parse(preferredTimes) : [],
        sessionType,
        priority,
        status,
        createdAt,
        notes: notes?.replace(/"/g, '') || ''
      }
    })

    return NextResponse.json({ success: true, waitlist })
  } catch (error) {
    console.error('Error reading waitlist:', error)
    return NextResponse.json({ error: 'Failed to load waitlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      patientName, 
      patientEmail, 
      patientPhone, 
      preferredDates = [], 
      preferredTimes = [], 
      sessionType = "Single Session",
      priority = "normal",
      notes = "" 
    } = await request.json()

    if (!patientName || !patientEmail) {
      return NextResponse.json(
        { error: 'Patient name and email required' },
        { status: 400 }
      )
    }

    await ensureWaitlistFile()

    const waitlistId = uuidv4()
    const waitlistEntry = [
      waitlistId,
      patientName,
      patientEmail,
      patientPhone || '',
      `"${JSON.stringify(preferredDates)}"`,
      `"${JSON.stringify(preferredTimes)}"`,
      sessionType,
      priority,
      'active',
      new Date().toISOString(),
      `"${notes}"`
    ].join(',')

    await fs.appendFile(WAITLIST_FILE, waitlistEntry + '\n')

    return NextResponse.json({
      success: true,
      waitlistId,
      message: 'Added to waitlist successfully'
    })

  } catch (error) {
    console.error('Waitlist add error:', error)
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { waitlistId, status, notes } = await request.json()
    
    if (!waitlistId || !status) {
      return NextResponse.json(
        { error: 'Waitlist ID and status required' },
        { status: 400 }
      )
    }

    await ensureWaitlistFile()
    const content = await fs.readFile(WAITLIST_FILE, 'utf-8')
    const lines = content.split('\n')
    const header = lines[0]
    const dataLines = lines.slice(1).filter(line => line.trim())

    const updatedLines = dataLines.map(line => {
      const parts = parseCSVLine(line)
      if (parts[0] === waitlistId) {
        // Update status and notes
        parts[8] = status // status column
        parts[10] = `"${notes || parts[10]?.replace(/"/g, '') || ''}"` // notes column
        return parts.join(',')
      }
      return line
    })

    const newContent = header + '\n' + updatedLines.join('\n') + '\n'
    await fs.writeFile(WAITLIST_FILE, newContent)

    return NextResponse.json({
      success: true,
      message: 'Waitlist entry updated successfully'
    })

  } catch (error) {
    console.error('Waitlist update error:', error)
    return NextResponse.json(
      { error: 'Failed to update waitlist entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const waitlistId = searchParams.get('waitlistId')

    if (!waitlistId) {
      return NextResponse.json(
        { error: 'Waitlist ID required' },
        { status: 400 }
      )
    }

    await ensureWaitlistFile()
    const content = await fs.readFile(WAITLIST_FILE, 'utf-8')
    const lines = content.split('\n')
    const header = lines[0]
    const dataLines = lines.slice(1).filter(line => line.trim())

    const filteredLines = dataLines.filter(line => {
      const [currentWaitlistId] = parseCSVLine(line)
      return currentWaitlistId !== waitlistId
    })

    const newContent = header + '\n' + filteredLines.join('\n') + '\n'
    await fs.writeFile(WAITLIST_FILE, newContent)

    return NextResponse.json({
      success: true,
      message: 'Waitlist entry removed successfully'
    })

  } catch (error) {
    console.error('Waitlist delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove waitlist entry' },
      { status: 500 }
    )
  }
}