import { NextRequest, NextResponse } from 'next/server'
import { checkPatientExists } from '@/utils/jsonPatientStorage'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if patient exists by email
    const existingCheck = await checkPatientExists(email)

    return NextResponse.json({
      success: true,
      exists: existingCheck.exists,
      // Only return safe, non-sensitive info
      patient: existingCheck.exists ? {
        hasAccount: true,
        // No personal data returned for security
      } : null
    })

  } catch (error: any) {
    console.error('Email check API error:', error)
    return NextResponse.json({
      error: 'Failed to check email',
      details: error.message
    }, { status: 500 })
  }
}