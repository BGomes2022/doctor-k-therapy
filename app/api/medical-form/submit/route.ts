import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { encryptMedicalData } from '@/utils/encryption'
const googleWorkspaceService = require('@/utils/googleWorkspace')

const BOOKING_TOKENS_FILE = path.join(process.cwd(), 'booking-tokens.csv')
const csvHelpers = require('@/utils/csvHelpers')

async function ensureTokensFile() {
  try {
    await fs.access(BOOKING_TOKENS_FILE)
  } catch {
    await fs.writeFile(BOOKING_TOKENS_FILE, 'bookingToken,userId,medicalFormData,sessionPackage,sessionsTotal,sessionsUsed,patientEmail,patientName,expiresAt,createdAt\n')
  }
}

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
    const { userId, formData } = await request.json()

    if (!userId || !formData) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 }
      )
    }

    await ensureTokensFile()
    await csvHelpers.ensureExtendedCSVStructure()
    
    // Generate unique booking token
    const bookingToken = uuidv4()
    
    // Get session package from payment record
    // For now, we'll use a default package since we're using in-memory storage
    const sessionPackage = { name: "4 Sessions Package", price: 350 }
    
    // Calculate session details
    const sessionsTotal = csvHelpers.getSessionCountFromPackage(sessionPackage)
    const sessionsUsed = 0
    const patientEmail = 'ben.gomes28@gmail.com' // Test email for development
    const patientName = formData.fullName || 'Ben Gomes (Test Patient)'
    
    // Set expiry date (3 months from now)
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 3)
    
    // Store token data in CSV with encrypted medical data using extended format
    // For development, we'll use a simple JSON string instead of encryption
    const encryptedMedicalData = process.env.NODE_ENV === 'development' 
      ? JSON.stringify(formData)
      : encryptMedicalData(formData)
    const tokenLine = `${bookingToken},${userId},"${encryptedMedicalData}","${JSON.stringify(sessionPackage).replace(/"/g, '""')}",${sessionsTotal},${sessionsUsed},"${patientEmail}","${patientName}",${expiresAt.toISOString()},${new Date().toISOString()}\n`
    await fs.appendFile(BOOKING_TOKENS_FILE, tokenLine)

    // Send booking link email
    try {
      await sendBookingLinkEmail(
        patientEmail,
        bookingToken,
        patientName,
        sessionPackage
      )

      return NextResponse.json({
        success: true,
        message: 'Medical form submitted successfully. Check your email for the booking link.',
        bookingToken // Remove in production for security
      })

    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      return NextResponse.json({
        success: true,
        message: 'Medical form submitted successfully. Booking link will be sent shortly.',
        bookingToken // Fallback for development
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