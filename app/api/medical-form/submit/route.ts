import { NextRequest, NextResponse } from 'next/server'
import { savePatientData, checkPatientExists } from '@/utils/patientData'
const googleWorkspaceService = require('@/utils/googleWorkspace')


// Email service using Google Workspace
async function sendBookingLinkEmail(email: string, bookingToken: string, name: string, sessionPackage: any) {
  try {
    console.log(`📧 Sending booking link email to ${email}`)
    
    const result = await googleWorkspaceService.sendBookingLinkEmail({
      patientEmail: email,
      patientName: name,
      bookingToken: bookingToken,
      sessionPackage: sessionPackage
    })

    if (result.success) {
      console.log(`✅ Booking link email sent successfully to ${email}`)
      return true
    } else {
      console.error(`❌ Failed to send booking link email: ${result.error}`)
      return false
    }
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, formData, sessionPackage } = await request.json()

    console.log('📝 Medical Form Submit - Session Package received:', sessionPackage)
    console.log('📝 Medical Form Submit - Form Data received:', formData)

    if (!userId || !formData) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 }
      )
    }

    // Check if email already has active patient record
    const existingCheck = await checkPatientExists(formData.email)
    if (existingCheck.exists) {
      return NextResponse.json(
        { error: 'This email address is already registered. Please use your existing booking link or contact support.' },
        { status: 409 }
      )
    }
    
    // Use the session package from request or default
    const finalSessionPackage = sessionPackage || { 
      name: "4 Therapy Sessions", 
      price: 350,
      sessionType: 'therapy',
      blockDuration: 60
    }

    console.log('📦 Final Session Package used:', finalSessionPackage)
    
    // Save patient data to encrypted CSV file
    const patientResult = await savePatientData({
      patientEmail: formData.email,
      patientName: formData.fullName,
      sessionPackage: finalSessionPackage,
      medicalData: formData
    })

    if (!patientResult.success) {
      throw new Error('Failed to save patient data: ' + patientResult.error)
    }

    console.log(`✅ Patient saved to CSV: ${formData.fullName} (${patientResult.patientId})`)

    // Send booking link email
    try {
      await sendBookingLinkEmail(
        formData.email,
        patientResult.bookingToken,
        formData.fullName,
        finalSessionPackage
      )

      return NextResponse.json({
        success: true,
        message: 'Medical form submitted successfully. Check your email for the booking link.',
        bookingToken: patientResult.bookingToken // Remove in production for security
      })

    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      return NextResponse.json({
        success: true,
        message: 'Medical form submitted successfully. Booking link will be sent shortly.',
        bookingToken: patientResult.bookingToken // Fallback for development
      })
    }

  } catch (error) {
    console.error('Medical form submission error:', error)
    return NextResponse.json(
      { error: 'Form submission failed' },
      { status: 500 }
    )
  }
}

// Remove the GET endpoint as we're using CSV storage now