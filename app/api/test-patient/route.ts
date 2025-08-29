import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Simulate a complete medical form submission
    const testFormData = {
      fullName: "Test Patient Claude",
      email: "test.claude@example.com", 
      phone: "+49123456789",
      dateOfBirth: "1990-05-15",
      emergencyContactName: "Emergency Contact Name",
      emergencyContactPhone: "+49987654321",
      emergencyContactRelation: "Spouse",
      doctorName: "Dr. Test Doctor",
      doctorPhone: "+49555123456",
      currentMedications: "Test Medication 100mg daily",
      allergies: "Peanuts, Shellfish",
      medicalConditions: "Mild anxiety, occasional migraines",
      currentProblems: "Feeling stressed at work, difficulty sleeping",
      therapyHistory: "No previous therapy experience",
      therapyGoals: "Better stress management and improved sleep quality",
      suicidalThoughts: "No",
      substanceUse: "Occasional social drinking",
      dataConsent: true,
      treatmentConsent: true
    }

    const testSessionPackage = {
      id: "consultation",
      name: "Test Consultation", 
      price: 30,
      duration: "20 minutes"
    }

    // Call the actual medical form submit API
    const response = await fetch('http://localhost:3002/api/medical-form/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: 'test-user-id-' + Date.now(),
        formData: testFormData,
        sessionPackage: testSessionPackage
      })
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test patient created successfully!',
        bookingToken: result.bookingToken,
        testData: {
          name: testFormData.fullName,
          email: testFormData.email,
          expectedFields: Object.keys(testFormData)
        }
      })
    } else {
      throw new Error(result.error || 'Failed to create test patient')
    }

  } catch (error: any) {
    console.error('Test patient creation error:', error)
    return NextResponse.json({
      error: 'Failed to create test patient',
      details: error.message
    }, { status: 500 })
  }
}