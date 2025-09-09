import { NextRequest, NextResponse } from 'next/server'
import { savePatientData } from '@/utils/patientData'

export async function POST(request: NextRequest) {
  try {
    const { 
      bookingToken,
      userId,
      medicalFormData,
      sessionPackage
    } = await request.json()

    // Validate required fields
    if (!medicalFormData?.fullName || !medicalFormData?.email || !bookingToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save patient data using existing utility
    const result = await savePatientData({
      patientEmail: medicalFormData.email,
      patientName: medicalFormData.fullName,
      sessionPackage: sessionPackage,
      medicalData: medicalFormData
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create patient' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      patient: {
        patientId: result.patientId,
        bookingToken: result.bookingToken,
        name: medicalFormData.fullName,
        email: medicalFormData.email
      }
    })

  } catch (error: any) {
    console.error('Create patient error:', error)
    return NextResponse.json(
      { error: 'Failed to create patient', details: error.message },
      { status: 500 }
    )
  }
}