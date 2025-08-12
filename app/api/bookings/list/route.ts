import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.csv')

async function ensureBookingsFile() {
  try {
    await fs.access(BOOKINGS_FILE)
  } catch {
    await fs.writeFile(BOOKINGS_FILE, 'bookingId,bookingToken,date,time,sessionPackage,createdAt\n')
  }
}

export async function GET() {
  try {
    await ensureBookingsFile()
    const fileContent = await fs.readFile(BOOKINGS_FILE, 'utf-8')
    const lines = fileContent.split('\n').slice(1) // Skip header
    
    const bookedDates = lines
      .filter(line => line.trim())
      .map(line => {
        const [, , date, time] = line.split(',')
        return `${date}-${time}`
      })

    return NextResponse.json({ bookedDates })
  } catch (error) {
    console.error('Error listing bookings:', error)
    return NextResponse.json({ bookedDates: [] })
  }
}