import { NextResponse } from 'next/server'
import { getAllPatients } from '@/utils/patientData'
const googleWorkspaceService = require('@/utils/googleWorkspace')

export async function GET() {
  try {
    // Get patients from encrypted CSV file
    const patientsResult = await getAllPatients()
    let patients: any[] = []
    
    if (patientsResult.success) {
      patients = patientsResult.patients.map((patient: any) => ({
        bookingToken: patient.bookingToken,
        userId: patient.id,
        patientEmail: patient.patientEmail,
        patientName: patient.patientName,
        sessionPackage: patient.sessionPackage,
        sessionsTotal: getSessionCountFromPackage(patient.sessionPackage),
        sessionsUsed: 0, // Will be updated from calendar sessions
        sessionsRemaining: getSessionCountFromPackage(patient.sessionPackage),
        createdAt: patient.createdAt,
        medicalFormData: patient.medicalData,
        therapistNotes: '' // Initialize empty therapist notes
      }))
      
      console.log(`📋 Loaded ${patients.length} patients from CSV`)
    }
    
    // Get actual therapy sessions from Google Calendar (only real bookings)
    const sessionsResult = await googleWorkspaceService.getAllTherapySessions()
    let bookings = []
    
    if (sessionsResult.success) {
      // Filter only real therapy sessions (not patient records)
      const realSessions = sessionsResult.sessions.filter((session: any) => 
        session.extendedProperties?.private?.therapySession === 'true'
      )
      
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

// Helper function to get session count from package
function getSessionCountFromPackage(sessionPackage: any): number {
  if (!sessionPackage) return 1
  
  const packageName = sessionPackage.name?.toLowerCase() || ''
  
  if (packageName.includes('1 session') || packageName.includes('consultation')) return 1
  if (packageName.includes('4 session')) return 4
  if (packageName.includes('6 session')) return 6
  if (packageName.includes('8 session')) return 8
  
  return 4 // Default
}