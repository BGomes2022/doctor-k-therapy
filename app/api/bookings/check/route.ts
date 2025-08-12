import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.csv')

async function ensureBookingsFile() {
  try {
    await fs.access(BOOKINGS_FILE)
  } catch {
    // Create file with headers if it doesn't exist
    await fs.writeFile(BOOKINGS_FILE, 'bookingId,bookingToken,date,time,sessionPackage,createdAt\n')
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date required' }, { status: 400 })
  }

  try {
    await ensureBookingsFile()
    const fileContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
    const lines = fileContent.split('\n').slice(1) // Skip header
    
    const bookedSlots = lines
      .filter(line => line.trim())
      .map(line => {
        const [, , bookingDate, bookingTime] = line.split(',')
        return { date: bookingDate, time: bookingTime }
      })
      .filter(booking => booking.date === date)
      .map(booking => booking.time)

    return NextResponse.json({ bookedSlots })
  } catch (error) {
    console.error('Error checking bookings:', error)
    return NextResponse.json({ bookedSlots: [] })
  }
}