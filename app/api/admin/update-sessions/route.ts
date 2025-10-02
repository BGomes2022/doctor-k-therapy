import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface PatientData {
  id: string
  bookingToken: string
  basicInfo: {
    fullName: string
    email: string
    phone: string
    preferredLanguage: string
    createdAt: string
  }
  sessionInfo: {
    packageId: string
    packageName: string
    price: number
    sessionsTotal: number
    sessionsUsed: number
    validUntil: string
    sessionType?: string
  }
  status: string
  hasTherapistNotes: boolean
  lastActivity: string
  lastUpdated?: string
  updatedBy?: string
}

export async function POST(request: NextRequest) {
  try {
    // For now, skip authentication check since admin routes don't have proper auth setup
    // This matches the behavior of /api/admin/data which also has no auth
    // TODO: Add proper authentication to all admin routes

    const { bookingToken, sessionsTotal, sessionsUsed } = await request.json()

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    // Validate session values
    if (sessionsTotal !== undefined && sessionsTotal < 0) {
      return NextResponse.json(
        { error: 'Total sessions cannot be negative' },
        { status: 400 }
      )
    }

    if (sessionsUsed !== undefined && sessionsUsed < 0) {
      return NextResponse.json(
        { error: 'Used sessions cannot be negative' },
        { status: 400 }
      )
    }

    if (sessionsTotal !== undefined && sessionsUsed !== undefined && sessionsUsed > sessionsTotal) {
      return NextResponse.json(
        { error: 'Used sessions cannot exceed total sessions' },
        { status: 400 }
      )
    }

    // Load patients data
    const dataDir = path.join(process.cwd(), 'data')
    const patientsFile = path.join(dataDir, 'patients.json')

    const patientsContent = await fs.readFile(patientsFile, 'utf-8')
    const patients: PatientData[] = JSON.parse(patientsContent)

    // Find the patient to update
    const patientIndex = patients.findIndex(p => p.bookingToken === bookingToken)

    if (patientIndex === -1) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    const patient = patients[patientIndex]
    const oldTotal = patient.sessionInfo.sessionsTotal
    const oldUsed = patient.sessionInfo.sessionsUsed

    // Update session info
    if (sessionsTotal !== undefined) {
      patient.sessionInfo.sessionsTotal = sessionsTotal

      // Update package name if total changed
      if (sessionsTotal !== oldTotal) {
        const baseName = patient.sessionInfo.packageName.replace(/\(\d+ Sessions?\)/g, '').trim()
        patient.sessionInfo.packageName = `${baseName} (${sessionsTotal} Session${sessionsTotal !== 1 ? 's' : ''})`
      }
    }

    if (sessionsUsed !== undefined) {
      patient.sessionInfo.sessionsUsed = sessionsUsed
    }

    // Ensure used doesn't exceed total
    if (patient.sessionInfo.sessionsUsed > patient.sessionInfo.sessionsTotal) {
      patient.sessionInfo.sessionsUsed = patient.sessionInfo.sessionsTotal
    }

    // Update metadata
    patient.lastActivity = new Date().toISOString()
    patient.lastUpdated = new Date().toISOString()
    patient.updatedBy = 'Admin'

    // Save updated data
    patients[patientIndex] = patient
    await fs.writeFile(patientsFile, JSON.stringify(patients, null, 2), 'utf-8')

    // Calculate remaining sessions
    const sessionsRemaining = patient.sessionInfo.sessionsTotal - patient.sessionInfo.sessionsUsed

    console.log(`✅ Sessions updated for ${patient.basicInfo.fullName}:`)
    console.log(`   Total: ${oldTotal} → ${patient.sessionInfo.sessionsTotal}`)
    console.log(`   Used: ${oldUsed} → ${patient.sessionInfo.sessionsUsed}`)
    console.log(`   Remaining: ${sessionsRemaining}`)

    return NextResponse.json({
      success: true,
      patient: {
        bookingToken: patient.bookingToken,
        fullName: patient.basicInfo.fullName,
        sessionsTotal: patient.sessionInfo.sessionsTotal,
        sessionsUsed: patient.sessionInfo.sessionsUsed,
        sessionsRemaining,
        packageName: patient.sessionInfo.packageName,
        lastUpdated: patient.lastUpdated,
        updatedBy: patient.updatedBy
      }
    })

  } catch (error: any) {
    console.error('Session update error:', error)
    return NextResponse.json(
      { error: 'Failed to update sessions', details: error.message },
      { status: 500 }
    )
  }
}