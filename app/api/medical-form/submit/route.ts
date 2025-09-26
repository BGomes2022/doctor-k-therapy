import { NextRequest, NextResponse } from 'next/server'
import { savePatientData, checkPatientExists, addPackageToExistingPatient } from '@/utils/jsonPatientStorage'
const googleWorkspaceService = require('@/utils/google')


// Email service using Google Workspace
async function sendBookingLinkEmail(email: string, bookingToken: string, name: string, sessionPackage: any, language: string = 'en') {
  try {
    console.log(`📧 Sending booking link email to ${email} in ${language}`)

    const result = await googleWorkspaceService.sendBookingLinkEmail({
      patientEmail: email,
      patientName: name,
      bookingToken: bookingToken,
      sessionPackage: sessionPackage,
      language: language
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
      console.log(`🔄 Existing patient found: ${existingCheck.patient.basicInfo?.fullName}`)
      console.log(`📦 Adding new package: ${sessionPackage?.name}`)
      
      // UPGRADE SYSTEM: Add new package to existing patient instead of error
      const upgradeResult = await addPackageToExistingPatient(existingCheck.patient, sessionPackage)
      
      if (!upgradeResult.success) {
        return NextResponse.json(
          { error: 'Failed to upgrade package: ' + upgradeResult.error },
          { status: 500 }
        )
      }
      
      // Send upgrade email with existing booking token
      try {
        await sendBookingLinkEmail(
          formData.email,
          upgradeResult.bookingToken,
          existingCheck.patient.basicInfo?.fullName || formData.fullName,
          sessionPackage,
          formData.preferredLanguage || 'en'
        )

        // Send admin notification about package upgrade
        await googleWorkspaceService.sendAdminPackageNotification({
          patientName: existingCheck.patient.basicInfo?.fullName || formData.fullName,
          patientEmail: formData.email,
          sessionPackage: sessionPackage,
          purchaseDate: new Date().toLocaleDateString('en-US')
        })

        return NextResponse.json({
          success: true,
          message: 'Package upgraded successfully! Check your email for updated booking information.',
          bookingToken: upgradeResult.bookingToken,
          upgraded: true
        })
        
      } catch (emailError) {
        console.error('Upgrade email sending failed:', emailError)
        return NextResponse.json({
          success: true,
          message: 'Package upgraded successfully. Updated booking information will be sent shortly.',
          bookingToken: upgradeResult.bookingToken,
          upgraded: true
        })
      }
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

    // Send booking link email to patient
    try {
      await sendBookingLinkEmail(
        formData.email,
        patientResult.bookingToken,
        formData.fullName,
        finalSessionPackage,
        formData.preferredLanguage || 'en'
      )

      // Send admin notification about new package purchase
      await googleWorkspaceService.sendAdminPackageNotification({
        patientName: formData.fullName,
        patientEmail: formData.email,
        sessionPackage: finalSessionPackage,
        purchaseDate: new Date().toLocaleDateString('en-US')
      })

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