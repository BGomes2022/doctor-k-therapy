import { NextRequest, NextResponse } from 'next/server'
import { saveTherapistNotes, getTherapistNotes } from '@/utils/jsonPatientStorage'

export async function POST(request: NextRequest) {
  try {
    const { bookingToken, notes } = await request.json()

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    const result = await saveTherapistNotes(bookingToken, notes)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Notes saved successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to save notes' },
        { status: result.error === 'Patient not found' ? 404 : 500 }
      )
    }

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

    const result = await getTherapistNotes(bookingToken)
    
    return NextResponse.json({
      success: true,
      notes: result.notes || ''
    })

  } catch (error) {
    console.error('Therapist notes fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}