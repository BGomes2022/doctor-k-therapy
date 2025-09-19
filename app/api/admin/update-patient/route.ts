import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { updatePatientBasicInfo, updatePatientMedicalData } from "@/utils/jsonPatientStorage"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.email !== "dr.k@doctorktherapy.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookingToken, updates } = await req.json()

    if (!bookingToken || !updates) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(`🔄 Admin updating patient ${bookingToken}:`, updates)

    // Separate basic info updates from medical updates
    const basicUpdates: any = {}
    const medicalUpdates: any = {}

    // Basic info fields
    if (updates.email !== undefined) basicUpdates.email = updates.email
    if (updates.phone !== undefined) basicUpdates.phone = updates.phone
    if (updates.fullName !== undefined) basicUpdates.fullName = updates.fullName
    if (updates.archived !== undefined) basicUpdates.archived = updates.archived

    // Medical data fields
    const medicalFields = [
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
      'doctorName', 'doctorPhone', 'currentMedications', 'allergies', 'medicalConditions',
      'currentProblems', 'therapyGoals', 'therapyHistory', 'substanceUse', 'suicidalThoughts'
    ]

    medicalFields.forEach(field => {
      if (updates[field] !== undefined) {
        medicalUpdates[field] = updates[field]
      }
    })

    // Update basic info if there are basic updates
    if (Object.keys(basicUpdates).length > 0) {
      console.log('🔄 Updating basicInfo with:', basicUpdates)
      const basicResult = await updatePatientBasicInfo(bookingToken, basicUpdates)
      if (!basicResult.success) {
        console.error('❌ Failed to update basicInfo:', basicResult.error)
        return NextResponse.json({ error: basicResult.error }, { status: 500 })
      }
      console.log('✅ BasicInfo updated successfully')
    }

    // Update medical data if there are medical updates
    if (Object.keys(medicalUpdates).length > 0) {
      const medicalResult = await updatePatientMedicalData(bookingToken, medicalUpdates)
      if (!medicalResult.success) {
        return NextResponse.json({ error: medicalResult.error }, { status: 500 })
      }
    }

    console.log(`✅ Patient ${bookingToken} updated successfully`)

    return NextResponse.json({
      success: true,
      message: "Patient updated successfully"
    })

  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}