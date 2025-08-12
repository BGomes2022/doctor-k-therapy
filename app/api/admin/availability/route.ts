import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const AVAILABILITY_FILE = path.join(process.cwd(), 'availability.csv')

async function ensureAvailabilityFile() {
  try {
    await fs.access(AVAILABILITY_FILE)
  } catch {
    await fs.writeFile(AVAILABILITY_FILE, 'date,time,available,reason,dayOfWeek\n')
    
    // Initialize with default availability (Tuesday and Thursday)
    const defaultSlots = []
    const timeSlots = ['19:00', '21:00', '22:00', '23:00']
    
    // Add default weekly pattern for next 12 weeks
    for (let week = 0; week < 12; week++) {
      const tuesday = new Date()
      tuesday.setDate(tuesday.getDate() + (week * 7) + (2 - tuesday.getDay() + 7) % 7)
      
      const thursday = new Date()
      thursday.setDate(thursday.getDate() + (week * 7) + (4 - thursday.getDay() + 7) % 7)
      
      timeSlots.forEach(time => {
        defaultSlots.push(`${tuesday.toISOString().split('T')[0]},${time},true,"",Tuesday`)
        defaultSlots.push(`${thursday.toISOString().split('T')[0]},${time},true,"",Thursday`)
      })
    }
    
    await fs.appendFile(AVAILABILITY_FILE, defaultSlots.join('\n') + '\n')
  }
}

export async function GET() {
  try {
    await ensureAvailabilityFile()
    const content = await fs.readFile(AVAILABILITY_FILE, 'utf-8')
    const lines = content.split('\n').slice(1).filter(line => line.trim())
    
    const availability = lines.map(line => {
      const [date, time, available, reason, dayOfWeek] = line.split(',')
      return {
        date,
        time,
        available: available === 'true',
        reason: reason ? reason.replace(/"/g, '') : '',
        dayOfWeek
      }
    })

    return NextResponse.json({ success: true, availability })
  } catch (error) {
    console.error('Error reading availability:', error)
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, time, available, reason = "" } = await request.json()
    
    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time required' }, { status: 400 })
    }

    await ensureAvailabilityFile()
    
    // Read existing data
    const content = await fs.readFile(AVAILABILITY_FILE, 'utf-8')
    const lines = content.split('\n')
    const header = lines[0]
    const dataLines = lines.slice(1).filter(line => line.trim())
    
    // Special case: Clear all entries for a specific date
    if (time === 'CLEAR_ALL' && reason === 'CLEAR_DAY') {
      const filteredLines = dataLines.filter(line => {
        const [existingDate] = line.split(',')
        return existingDate !== date // Remove all entries for this date
      })
      
      const newContent = header + '\n' + filteredLines.join('\n') + '\n'
      await fs.writeFile(AVAILABILITY_FILE, newContent)
      
      return NextResponse.json({ success: true, message: 'All availability cleared for date' })
    }
    
    // Remove existing entry for this date/time
    const filteredLines = dataLines.filter(line => {
      const [existingDate, existingTime] = line.split(',')
      return !(existingDate === date && existingTime === time)
    })
    
    // Add new entry
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
    const newLine = `${date},${time},${available},"${reason}",${dayOfWeek}`
    filteredLines.push(newLine)
    
    // Write back to file
    const newContent = header + '\n' + filteredLines.join('\n') + '\n'
    await fs.writeFile(AVAILABILITY_FILE, newContent)
    
    return NextResponse.json({ success: true, message: 'Availability updated' })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}