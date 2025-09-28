import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAllPatients } from '@/utils/jsonPatientStorage'
const googleWorkspaceService = require('@/utils/google')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingToken } = await request.json()

    if (!bookingToken) {
      return NextResponse.json(
        { error: 'Booking token is required' },
        { status: 400 }
      )
    }

    const result = await getAllPatients()
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to load patients' },
        { status: 500 }
      )
    }

    const patient = result.patients.find(p => p.bookingToken === bookingToken)

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    const patientEmail = patient.medicalFormData?.email || patient.patientEmail
    const patientName = patient.medicalFormData?.fullName || patient.patientName
    const language = patient.medicalFormData?.preferredLanguage || 'en'

    if (!patientEmail) {
      return NextResponse.json(
        { error: 'Patient email not found' },
        { status: 400 }
      )
    }

    console.log(`📧 Resending booking link to ${patientEmail}`)

    const emailResult = await googleWorkspaceService.sendSimpleBookingLinkEmail({
      patientEmail,
      patientName,
      bookingToken,
      language
    })

    if (emailResult.success) {
      console.log(`✅ Booking link resent successfully to ${patientEmail}`)
      return NextResponse.json({
        success: true,
        message: 'Booking link sent successfully'
      })
    } else {
      console.error(`❌ Failed to resend booking link: ${emailResult.error}`)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Resend booking link error:', error)
    return NextResponse.json(
      { error: 'Failed to resend booking link' },
      { status: 500 }
    )
  }
}