import { promises as fs } from 'fs'
import path from 'path'
import { encryptMedicalData, decryptMedicalData, decryptData, generateSecureToken } from './encryption'

const PATIENTS_CSV_PATH = path.join(process.cwd(), 'data', 'patients.csv')

interface PatientRecord {
  id: string
  bookingToken: string
  patientEmail: string
  patientName: string
  sessionPackage: any
  encryptedMedicalData: string
  createdAt: string
  status: 'active' | 'inactive'
}


// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Parse CSV content
function parseCSV(content: string): string[][] {
  if (!content.trim()) return []
  
  const lines = content.split('\n').filter(line => line.trim())
  return lines.map(line => {
    // Simple CSV parsing - handles basic cases
    const values = []
    let currentValue = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"' && !inQuotes) {
        inQuotes = true
      } else if (char === '"' && inQuotes) {
        inQuotes = false
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue)
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    values.push(currentValue)
    
    return values
  })
}

// Convert array to CSV line
function arrayToCSVLine(values: string[]): string {
  return values.map(value => {
    // Escape quotes and wrap in quotes if contains comma or quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }).join(',')
}

// Save patient data to encrypted CSV
export async function savePatientData(patientData: {
  patientEmail: string
  patientName: string
  sessionPackage: any
  medicalData: any
}): Promise<{ success: boolean; patientId: string; bookingToken: string; error?: string }> {
  try {
    await ensureDataDirectory()
    
    const patientId = generateSecureToken(16)
    const bookingToken = generateSecureToken(32)
    
    // Encrypt medical data
    const encryptedMedicalData = encryptMedicalData(patientData.medicalData)
    
    const patientRecord: PatientRecord = {
      id: patientId,
      bookingToken,
      patientEmail: patientData.patientEmail,
      patientName: patientData.patientName,
      sessionPackage: JSON.stringify(patientData.sessionPackage),
      encryptedMedicalData,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    
    // Read existing CSV or create header
    let csvContent = ''
    try {
      csvContent = await fs.readFile(PATIENTS_CSV_PATH, 'utf-8')
    } catch {
      // Create header if file doesn't exist
      csvContent = 'id,bookingToken,patientEmail,patientName,sessionPackage,encryptedMedicalData,createdAt,status\n'
    }
    
    // Add new patient record
    const newLine = arrayToCSVLine([
      patientRecord.id,
      patientRecord.bookingToken,
      patientRecord.patientEmail,
      patientRecord.patientName,
      patientRecord.sessionPackage,
      patientRecord.encryptedMedicalData,
      patientRecord.createdAt,
      patientRecord.status
    ])
    
    csvContent += newLine + '\n'
    
    // Write to file
    await fs.writeFile(PATIENTS_CSV_PATH, csvContent, 'utf-8')
    
    console.log(`✅ Patient data saved: ${patientData.patientName} (${patientId})`)
    
    return {
      success: true,
      patientId,
      bookingToken
    }
    
  } catch (error: any) {
    console.error('❌ Failed to save patient data:', error)
    return {
      success: false,
      patientId: '',
      bookingToken: '',
      error: error.message
    }
  }
}

// Get all patients
export async function getAllPatients(): Promise<{ success: boolean; patients: any[]; error?: string }> {
  try {
    await ensureDataDirectory()
    
    let csvContent = ''
    try {
      csvContent = await fs.readFile(PATIENTS_CSV_PATH, 'utf-8')
    } catch {
      return { success: true, patients: [] }
    }
    
    const rows = parseCSV(csvContent)
    if (rows.length < 2) return { success: true, patients: [] } // No data rows
    
    const headers = rows[0]
    const patients = rows.slice(1).map(row => {
      const patient: any = {}
      headers.forEach((header, index) => {
        patient[header] = row[index] || ''
      })
      
      // Decrypt medical data
      try {
        // First try to decrypt the data
        const decryptedString = decryptData(patient.encryptedMedicalData)
        console.log(`🔓 Raw decrypted string:`, decryptedString.substring(0, 200) + '...')
        
        // Then try to parse as JSON
        patient.medicalData = JSON.parse(decryptedString)
        patient.sessionPackage = JSON.parse(patient.sessionPackage)
        console.log(`✅ Successfully decrypted and parsed data for patient ${patient.id}`)
      } catch (error) {
        console.error(`❌ Failed to decrypt/parse data for patient ${patient.id}:`, error.message)
        console.error(`Encrypted data sample:`, patient.encryptedMedicalData.substring(0, 100) + '...')
        patient.medicalData = null
        patient.sessionPackage = null
      }
      
      return patient
    })
    
    return { success: true, patients }
    
  } catch (error: any) {
    console.error('❌ Failed to get patients:', error)
    return { success: false, patients: [], error: error.message }
  }
}

// Check if patient exists by email
export async function checkPatientExists(email: string): Promise<{ exists: boolean; patient?: any }> {
  try {
    const result = await getAllPatients()
    if (!result.success) return { exists: false }
    
    const existingPatient = result.patients.find(p => p.patientEmail === email && p.status === 'active')
    
    return {
      exists: !!existingPatient,
      patient: existingPatient
    }
    
  } catch (error) {
    console.error('❌ Failed to check patient exists:', error)
    return { exists: false }
  }
}

// Get patient by booking token
export async function getPatientByToken(bookingToken: string): Promise<{ success: boolean; patient?: any; error?: string }> {
  try {
    const result = await getAllPatients()
    if (!result.success) return { success: false, error: result.error }
    
    const patient = result.patients.find(p => p.bookingToken === bookingToken && p.status === 'active')
    
    if (!patient) {
      return { success: false, error: 'Patient not found or token invalid' }
    }
    
    return { success: true, patient }
    
  } catch (error: any) {
    console.error('❌ Failed to get patient by token:', error)
    return { success: false, error: error.message }
  }
}


// Delete all test data (for cleanup)
export async function deleteAllTestData(): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    let deleted = 0
    
    // Delete patients CSV
    try {
      await fs.unlink(PATIENTS_CSV_PATH)
      deleted++
    } catch {}
    
    console.log(`🗑️ Deleted ${deleted} CSV files`)
    
    return { success: true, deleted }
    
  } catch (error: any) {
    console.error('❌ Failed to delete test data:', error)
    return { success: false, deleted: 0, error: error.message }
  }
}