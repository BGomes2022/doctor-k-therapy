import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const BOOKINGS_FILE = path.join(process.cwd(), 'bookings.csv')

function parseCSVLine(line: string): string[] {
  const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),"(.+)",(.+)$/)
  if (match) {
    return [match[1], match[2], match[3], match[4], match[5], match[6]]
  }
  return line.split(',')
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, action, newDate, newTime, reason = "", message = "" } = await request.json()

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: 'Booking ID and action required' },
        { status: 400 }
      )
    }

    if (action === 'reschedule') {
      if (!newDate || !newTime) {
        return NextResponse.json(
          { error: 'New date and time required for rescheduling' },
          { status: 400 }
        )
      }

      const content = await fs.readFile(BOOKINGS_FILE, 'utf-8')
      const lines = content.split('\n')
      const header = lines[0]
      const bookingLines = lines.slice(1).filter(line => line.trim())

      // Check if new slot is available
      const newSlotTaken = bookingLines.some(line => {
        const [currentBookingId, , date, time] = parseCSVLine(line)
        return currentBookingId !== bookingId && date === newDate && time === newTime
      })

      if (newSlotTaken) {
        return NextResponse.json(
          { error: 'New time slot is already booked' },
          { status: 409 }
        )
      }

      // Update the booking
      const updatedLines = bookingLines.map(line => {
        const [currentBookingId, bookingToken, date, time, sessionPackage, createdAt] = parseCSVLine(line)
        
        if (currentBookingId === bookingId) {
          return `${bookingId},${bookingToken},${newDate},${newTime},"${sessionPackage}",${createdAt}`
        }
        return line
      })

      const newContent = header + '\n' + updatedLines.join('\n') + '\n'
      await fs.writeFile(BOOKINGS_FILE, newContent)

      return NextResponse.json({
        success: true,
        message: 'Booking rescheduled successfully'
      })

    } else if (action === 'cancel') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Cancellation reason required' },
          { status: 400 }
        )
      }

      const content = await fs.readFile(BOOKINGS_FILE, 'utf-8')
      const lines = content.split('\n')
      const header = lines[0]
      const bookingLines = lines.slice(1).filter(line => line.trim())

      // Remove the booking
      const filteredLines = bookingLines.filter(line => {
        const [currentBookingId] = parseCSVLine(line)
        return currentBookingId !== bookingId
      })

      const newContent = header + '\n' + filteredLines.join('\n') + '\n'
      await fs.writeFile(BOOKINGS_FILE, newContent)

      // TODO: In a real app, you'd send an email to the patient here
      console.log(`Booking ${bookingId} cancelled. Reason: ${reason}. Message: ${message}`)

      return NextResponse.json({
        success: true,
        message: 'Booking cancelled successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "reschedule" or "cancel"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Booking modification error:', error)
    return NextResponse.json(
      { error: 'Failed to modify booking' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { bookingId, newDate, newTime, reason = "" } = await request.json()

    if (!bookingId || !newDate || !newTime) {
      return NextResponse.json(
        { error: 'Booking ID, new date and time required' },
        { status: 400 }
      )
    }

    const content = await fs.readFile(BOOKINGS_FILE, 'utf-8')
    const lines = content.split('\n')
    const header = lines[0]
    const bookingLines = lines.slice(1).filter(line => line.trim())

    // Check if new slot is available
    const newSlotTaken = bookingLines.some(line => {
      const [currentBookingId, , date, time] = parseCSVLine(line)
      return currentBookingId !== bookingId && date === newDate && time === newTime
    })

    if (newSlotTaken) {
      return NextResponse.json(
        { error: 'New time slot is already booked' },
        { status: 409 }
      )
    }

    // Update the booking
    const updatedLines = bookingLines.map(line => {
      const [currentBookingId, bookingToken, date, time, sessionPackage, createdAt] = parseCSVLine(line)
      
      if (currentBookingId === bookingId) {
        return `${bookingId},${bookingToken},${newDate},${newTime},"${sessionPackage}",${createdAt}`
      }
      return line
    })

    const newContent = header + '\n' + updatedLines.join('\n') + '\n'
    await fs.writeFile(BOOKINGS_FILE, newContent)

    return NextResponse.json({
      success: true,
      message: 'Booking modified successfully'
    })

  } catch (error) {
    console.error('Booking modification error:', error)
    return NextResponse.json(
      { error: 'Failed to modify booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    const content = await fs.readFile(BOOKINGS_FILE, 'utf-8')
    const lines = content.split('\n')
    const header = lines[0]
    const bookingLines = lines.slice(1).filter(line => line.trim())

    // Remove the booking
    const filteredLines = bookingLines.filter(line => {
      const [currentBookingId] = parseCSVLine(line)
      return currentBookingId !== bookingId
    })

    const newContent = header + '\n' + filteredLines.join('\n') + '\n'
    await fs.writeFile(BOOKINGS_FILE, newContent)

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    })

  } catch (error) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}