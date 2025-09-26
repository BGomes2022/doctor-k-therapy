import { NextResponse } from 'next/server'
import { getAllPatients } from '@/utils/jsonPatientStorage'
const googleWorkspaceService = require('@/utils/google')
const bookingCache = require('@/lib/bookingCache')

export async function GET() {
  try {
    // Use the proper getAllPatients function that decrypts medical data
    const patientsResult = await getAllPatients()
    let patients: any[] = []
    
    if (patientsResult.success) {
      patients = patientsResult.patients.map((patient: any) => ({
        bookingToken: patient.bookingToken,
        userId: patient.userId,
        // Use basicInfo for current contact data, fall back to medical data, then old fields
        patientEmail: patient.basicInfo?.email || patient.medicalFormData?.email || patient.patientEmail || 'Unknown',
        patientName: patient.basicInfo?.fullName || patient.medicalFormData?.fullName || patient.patientName || 'Unknown',
        sessionPackage: patient.sessionPackage,
        sessionsTotal: patient.sessionsTotal || 1,
        sessionsUsed: 0, // Will be updated from calendar sessions
        sessionsRemaining: patient.sessionsRemaining || 1,
        createdAt: patient.createdAt,
        medicalFormData: {
          // Merge basicInfo into medicalFormData for consistent access
          ...patient.medicalFormData,
          fullName: patient.basicInfo?.fullName || patient.medicalFormData?.fullName,
          email: patient.basicInfo?.email || patient.medicalFormData?.email,
          phone: patient.basicInfo?.phone || patient.medicalFormData?.phone
        },
        therapistNotes: patient.therapistNotes || ''
      }))
      
      console.log(`📋 Loaded ${patients.length} patients with decrypted medical data`)
    } else {
      console.error('❌ Failed to load patients:', patientsResult.error)
    }
    
    // Get cached bookings first (immediate visibility for manual bookings)
    const cachedBookings = await bookingCache.getCachedBookings()
    console.log(`💾 Found ${cachedBookings.length} cached bookings`)

    // Get actual therapy sessions from Google Calendar (synced bookings)
    const sessionsResult = await googleWorkspaceService.getAllTherapySessions()
    let bookings = []

    console.log('🔍 DEBUG - Google Calendar Response:', JSON.stringify(sessionsResult, null, 2))

    if (sessionsResult.success) {
      // Don't filter - show ALL sessions for debugging
      const realSessions = sessionsResult.sessions || []
      console.log(`📅 Found ${realSessions.length} total sessions from Google Calendar`)

      // Transform calendar events to booking format
      const calendarBookings = realSessions.map((session: any) => ({
        bookingId: session.eventId,
        bookingToken: session.bookingToken || '',
        date: session.start ? new Date(session.start).toISOString().split('T')[0] : '',
        time: session.start ? new Date(session.start).toTimeString().split(' ')[0].substring(0, 5) : '',
        sessionPackage: session.sessionPackage || { name: 'Unknown Package', price: 0 },
        createdAt: session.start,
        meetLink: session.meetLink,
        calendarEventId: session.eventId,
        sessionNumber: session.sessionNumber,
        totalSessions: session.totalSessions,
        patientEmail: session.patientEmail,
        patientName: session.patientName,
        status: new Date(session.start) > new Date() ? 'scheduled' : 'completed',
        source: 'calendar'
      }))

      // Transform cached sessions to booking format
      const cachedBookingsFormatted = cachedBookings.map((session: any) => ({
        bookingId: session.eventId,
        bookingToken: session.bookingToken || '',
        date: session.start ? new Date(session.start).toISOString().split('T')[0] : '',
        time: session.start ? new Date(session.start).toTimeString().split(' ')[0].substring(0, 5) : '',
        sessionPackage: session.sessionPackage || { name: 'Unknown Package', price: 0 },
        createdAt: session.start,
        meetLink: session.meetLink,
        calendarEventId: session.eventId,
        sessionNumber: session.sessionNumber,
        totalSessions: session.totalSessions,
        patientEmail: session.patientEmail,
        patientName: session.patientName,
        status: new Date(session.start) > new Date() ? 'scheduled' : 'completed',
        source: 'cache',
        isFromCache: true,
        cachedAt: session.cachedAt
      }))

      // Remove duplicates (if a cached booking is now in calendar, prefer calendar version)
      const calendarEventIds = new Set(calendarBookings.map(b => b.bookingId))
      const uniqueCachedBookings = cachedBookingsFormatted.filter(b => !calendarEventIds.has(b.bookingId))

      // Combine calendar and cached bookings
      bookings = [...calendarBookings, ...uniqueCachedBookings]

      console.log(`📋 Combined: ${calendarBookings.length} calendar + ${uniqueCachedBookings.length} cached = ${bookings.length} total bookings`)

      // Clean up cache for synced bookings (they're now in calendar)
      for (const booking of cachedBookingsFormatted) {
        if (calendarEventIds.has(booking.bookingId)) {
          await bookingCache.removeBooking(booking.bookingId)
        }
      }
    } else {
      // If calendar API fails, show only cached bookings
      bookings = cachedBookings.map((session: any) => ({
        bookingId: session.eventId,
        bookingToken: session.bookingToken || '',
        date: session.start ? new Date(session.start).toISOString().split('T')[0] : '',
        time: session.start ? new Date(session.start).toTimeString().split(' ')[0].substring(0, 5) : '',
        sessionPackage: session.sessionPackage || { name: 'Unknown Package', price: 0 },
        createdAt: session.start,
        meetLink: session.meetLink,
        calendarEventId: session.eventId,
        sessionNumber: session.sessionNumber,
        totalSessions: session.totalSessions,
        patientEmail: session.patientEmail,
        patientName: session.patientName,
        status: new Date(session.start) > new Date() ? 'scheduled' : 'completed',
        source: 'cache_only',
        isFromCache: true
      }))
    }
    // Update session counts for patients based on actual bookings (calendar + cached)
    patients.forEach(patient => {
      const patientSessions = bookings.filter(booking => booking.bookingToken === patient.bookingToken)
      patient.sessionsUsed = patientSessions.length
      patient.sessionsRemaining = patient.sessionsTotal - patientSessions.length
    })

    console.log(`📋 Found ${bookings.length} total therapy sessions (calendar + cached)`)

    // Clean up expired cache entries
    await bookingCache.clearExpiredBookings()

    console.log('Sending response - bookings:', bookings.length)
    console.log('Sending response - patients:', patients.length)

    return NextResponse.json({
      success: true,
      bookings: bookings,
      patients: patients
    })

  } catch (error: any) {
    console.error('Admin data API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch admin data',
      details: error.message
    }, { status: 500 })
  }
}

// Session counts are now stored directly in JSON patient.sessionInfo.sessionsTotal