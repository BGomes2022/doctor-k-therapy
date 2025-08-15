import { NextResponse } from 'next/server'
import { loadJsonFile, ensureDirectoryExists } from '@/utils/jsonPatientStorage'
import path from 'path'
const googleWorkspaceService = require('@/utils/googleWorkspace')

const DATA_DIR = path.join(process.cwd(), 'data')
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json')

export async function GET() {
  try {
    await ensureDirectoryExists(DATA_DIR)
    
    // Direkt aus patients.json lesen - keine Transformation
    const patientsData = await loadJsonFile<any[]>(PATIENTS_FILE, [])
    let patients: any[] = []
    
    if (patientsData.length > 0) {
      patients = patientsData.map((patient: any) => ({
        bookingToken: patient.bookingToken,
        userId: patient.id,
        patientEmail: patient.basicInfo?.email || 'Unknown',
        patientName: patient.basicInfo?.fullName || 'Unknown',
        sessionPackage: patient.sessionInfo,
        sessionsTotal: patient.sessionInfo?.sessionsTotal || 1,
        sessionsUsed: 0, // Will be updated from calendar sessions
        sessionsRemaining: patient.sessionInfo?.sessionsTotal || 1,
        createdAt: patient.createdAt,
        medicalFormData: patient.medicalFormData,
        therapistNotes: '' // Initialize empty therapist notes
      }))
      
      console.log(`📋 Loaded ${patients.length} patients from CSV`)
    }
    
    // Get actual therapy sessions from Google Calendar (only real bookings)
    const sessionsResult = await googleWorkspaceService.getAllTherapySessions()
    let bookings = []
    
    console.log('🔍 DEBUG - Google Calendar Response:', JSON.stringify(sessionsResult, null, 2))
    
    if (sessionsResult.success) {
      // Don't filter - show ALL sessions for debugging
      const realSessions = sessionsResult.sessions || []
      console.log(`📅 Found ${realSessions.length} total sessions from Google Calendar`)
      
      // Transform calendar events to booking format
      bookings = realSessions.map((session: any) => ({
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
        status: new Date(session.start) > new Date() ? 'scheduled' : 'completed'
      }))
      
      // Update session counts for patients based on actual bookings
      patients.forEach(patient => {
        const patientSessions = bookings.filter(booking => booking.bookingToken === patient.bookingToken)
        patient.sessionsUsed = patientSessions.length
        patient.sessionsRemaining = patient.sessionsTotal - patientSessions.length
      })
      
      console.log(`📋 Found ${bookings.length} real therapy sessions`)
    }

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