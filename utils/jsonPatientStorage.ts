// utils/jsonPatientStorage.ts - KOMPLETT NEUE JSON-BASIERTE IMPLEMENTIERUNG
import { promises as fs } from 'fs'
import path from 'path'
import { generateSecureToken, encryptMedicalData, decryptMedicalData, createDataSignature, verifyDataSignature } from './encryption'
import crypto from 'crypto'

// Typen für bessere Code-Qualität definieren
interface PatientBasicInfo {
  id: string
  bookingToken: string
  basicInfo: {
    fullName: string
    email: string
    phone: string
    createdAt: string
  }
  sessionInfo: {
    packageId: string
    packageName: string
    price: number
    sessionsTotal: number
    sessionsUsed: number
    validUntil: string
  }
  status: 'active' | 'inactive'
  hasTherapistNotes: boolean
  lastActivity: string
}

interface MedicalDataFile {
  encryptedData: string // AES-256 verschlüsselte medizinische Daten
  metadata: {
    savedAt: string
    formVersion: string
    dataIntegrityHash: string
    encryptionMethod: string
  }
}

// Pfade für die verschiedenen Dateien definieren
const DATA_DIR = path.join(process.cwd(), 'data')
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json')
const MEDICAL_DIR = path.join(DATA_DIR, 'medical')
const NOTES_DIR = path.join(DATA_DIR, 'notes')

// Hilfsfunktionen für Datei-Operationen
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function loadJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    // Datei existiert nicht oder ist beschädigt - Standardwert zurückgeben
    console.log(`📄 Datei nicht gefunden oder leer: ${filePath}, verwende Standardwert`)
    return defaultValue
  }
}

async function saveJsonFile<T>(filePath: string, data: T): Promise<void> {
  const content = JSON.stringify(data, null, 2) // Schön formatiert für Debugging
  await fs.writeFile(filePath, content, 'utf-8')
}

// Hauptfunktion: Patient speichern
export async function savePatientData(patientData: {
  patientEmail: string
  patientName: string
  sessionPackage: any
  medicalData: any
}): Promise<{ success: boolean; patientId: string; bookingToken: string; error?: string }> {
  try {
    // Zunächst alle nötigen Verzeichnisse erstellen
    await ensureDirectoryExists(DATA_DIR)
    await ensureDirectoryExists(MEDICAL_DIR)
    await ensureDirectoryExists(NOTES_DIR)
    
    // Eindeutige IDs generieren
    const patientId = generateSecureToken(16)
    const bookingToken = generateSecureToken(32)
    
    // Session-Informationen aus dem Paket extrahieren - DEBUG VERSION
    console.log('🔥 SESSION PACKAGE DEBUG:', {
      id: patientData.sessionPackage.id,
      name: patientData.sessionPackage.name,
      fullPackage: patientData.sessionPackage
    })
    
    const sessionsTotal = patientData.sessionPackage.id === 'six-sessions' ? 6 : 
                          patientData.sessionPackage.id === 'four-sessions' ? 4 : 
                          patientData.sessionPackage.name?.includes('6') ? 6 : 4
                          
    console.log('🔥 CALCULATED sessionsTotal:', sessionsTotal)
    const validUntil = new Date()
    validUntil.setMonth(validUntil.getMonth() + 3) // 3 Monate gültig
    
    // 1. Grunddaten für die Patientenliste vorbereiten
    const patientBasicInfo: PatientBasicInfo = {
      id: patientId,
      bookingToken,
      basicInfo: {
        fullName: patientData.patientName,
        email: patientData.patientEmail,
        phone: patientData.medicalData.phone || '',
        createdAt: new Date().toISOString()
      },
      sessionInfo: {
        packageId: patientData.sessionPackage.id || 'unknown',
        packageName: patientData.sessionPackage.name,
        price: patientData.sessionPackage.price,
        sessionsTotal: getCorrectSessionCount(patientData.sessionPackage),
        sessionsUsed: 0,
        validUntil: validUntil.toISOString()
      },
      status: 'active',
      hasTherapistNotes: false,
      lastActivity: new Date().toISOString()
    }
    
    // 2. Medizinische Daten verschlüsseln (AES-256-CBC)
    console.log('🔐 Verschlüssele medizinische Daten für Patient:', patientData.patientName)
    const encryptedMedicalData = encryptMedicalData(patientData.medicalData)
    
    const medicalDataFile: MedicalDataFile = {
      encryptedData: encryptedMedicalData,
      metadata: {
        savedAt: new Date().toISOString(),
        formVersion: '1.0',
        dataIntegrityHash: createDataSignature(JSON.stringify(patientData.medicalData)),
        encryptionMethod: 'AES-256-CBC'
      }
    }
    
    // 3. Bestehende Patientenliste laden und neuen Patient hinzufügen
    const existingPatients = await loadJsonFile<PatientBasicInfo[]>(PATIENTS_FILE, [])
    existingPatients.push(patientBasicInfo)
    
    // 4. Alle Daten speichern
    await saveJsonFile(PATIENTS_FILE, existingPatients)
    await saveJsonFile(path.join(MEDICAL_DIR, `${bookingToken}.json`), medicalDataFile)
    
    console.log(`✅ Patient erfolgreich gespeichert: ${patientData.patientName} (${patientId})`)
    console.log(`📁 Medizinische Daten gespeichert in: medical/${bookingToken}.json`)
    
    return {
      success: true,
      patientId,
      bookingToken
    }
    
  } catch (error: any) {
    console.error('❌ Fehler beim Speichern des Patienten:', error)
    return {
      success: false,
      patientId: '',
      bookingToken: '',
      error: error.message
    }
  }
}

// Alle Patienten für das Admin Dashboard laden
export async function getAllPatients(): Promise<{ success: boolean; patients: any[]; error?: string }> {
  try {
    await ensureDirectoryExists(DATA_DIR)
    
    // 1. Grunddaten aller Patienten laden
    const patientsBasicInfo = await loadJsonFile<PatientBasicInfo[]>(PATIENTS_FILE, [])
    
    console.log(`📋 Lade ${patientsBasicInfo.length} Patienten aus JSON...`)
    
    // 2. Für jeden Patienten die medizinischen Daten laden
    const patientsWithMedicalData = await Promise.all(
      patientsBasicInfo.map(async (patient) => {
        try {
          // Medizinische Daten laden und entschlüsseln
          const medicalFilePath = path.join(MEDICAL_DIR, `${patient.bookingToken}.json`)
          const medicalFile = await loadJsonFile<MedicalDataFile>(medicalFilePath, {
            encryptedData: '',
            metadata: { savedAt: '', formVersion: '', dataIntegrityHash: '', encryptionMethod: '' }
          })
          
          // Medizinische Daten entschlüsseln falls vorhanden
          let decryptedMedicalData = {}
          if (medicalFile.encryptedData) {
            try {
              console.log('🔓 Entschlüssele medizinische Daten für Patient:', patient.basicInfo.fullName)
              decryptedMedicalData = decryptMedicalData(medicalFile.encryptedData)
              
              // Datenintegrität prüfen
              const isValid = verifyDataSignature(
                JSON.stringify(decryptedMedicalData), 
                medicalFile.metadata.dataIntegrityHash
              )
              if (!isValid) {
                console.warn('⚠️ Datenintegrität verletzt für Patient:', patient.basicInfo.fullName)
              }
            } catch (decryptError) {
              console.error('❌ Entschlüsselung fehlgeschlagen für Patient:', patient.basicInfo.fullName, decryptError)
              // Fallback zu leeren Daten
              decryptedMedicalData = {
                fullName: patient.basicInfo.fullName,
                email: patient.basicInfo.email,
                phone: patient.basicInfo.phone,
                error: 'Entschlüsselung fehlgeschlagen'
              }
            }
          }
          
          // Therapist Notes prüfen
          const notesFilePath = path.join(NOTES_DIR, `${patient.bookingToken}.json`)
          let therapistNotes = ''
          try {
            const notesFile = await loadJsonFile(notesFilePath, { notes: [], lastUpdated: '' })
            therapistNotes = notesFile.notes?.map((note: any) => note.content).join('\n\n') || ''
          } catch {
            // Keine Notes vorhanden
          }
          
          // Alles zusammenführen für das Admin Dashboard
          console.log(`🔍 Patient ${patient.basicInfo.fullName} medical data decrypted successfully`)
          return {
            bookingToken: patient.bookingToken,
            userId: patient.id,
            patientEmail: patient.basicInfo.email,
            patientName: patient.basicInfo.fullName,
            medicalFormData: decryptedMedicalData, // Die entschlüsselten medizinischen Daten!
            sessionPackage: {
              name: patient.sessionInfo.packageName,
              price: patient.sessionInfo.price,
              id: patient.sessionInfo.packageId
            },
            sessionsTotal: patient.sessionInfo.sessionsTotal,
            sessionsUsed: patient.sessionInfo.sessionsUsed,
            sessionsRemaining: patient.sessionInfo.sessionsTotal - patient.sessionInfo.sessionsUsed,
            createdAt: patient.basicInfo.createdAt,
            therapistNotes: therapistNotes
          }
        } catch (error) {
          console.error(`⚠️ Fehler beim Laden der Daten für Patient ${patient.id}:`, error)
          // Fallback: Patient ohne medizinische Daten zurückgeben
          return {
            bookingToken: patient.bookingToken,
            userId: patient.id,
            patientEmail: patient.basicInfo.email,
            patientName: patient.basicInfo.fullName,
            medicalFormData: { 
              fullName: patient.basicInfo.fullName, 
              email: patient.basicInfo.email,
              phone: patient.basicInfo.phone 
            },
            sessionPackage: { 
              name: patient.sessionInfo.packageName, 
              price: patient.sessionInfo.price,
              id: patient.sessionInfo.packageId
            },
            sessionsTotal: patient.sessionInfo.sessionsTotal,
            sessionsUsed: patient.sessionInfo.sessionsUsed,
            sessionsRemaining: patient.sessionInfo.sessionsTotal - patient.sessionInfo.sessionsUsed,
            createdAt: patient.basicInfo.createdAt,
            therapistNotes: ''
          }
        }
      })
    )
    
    console.log(`✅ ${patientsWithMedicalData.length} Patienten erfolgreich geladen mit medizinischen Daten`)
    
    return { success: true, patients: patientsWithMedicalData }
    
  } catch (error: any) {
    console.error('❌ Fehler beim Laden der Patienten:', error)
    return { success: false, patients: [], error: error.message }
  }
}

// Check if patient exists by email
export async function checkPatientExists(email: string): Promise<{ exists: boolean; patient?: any }> {
  try {
    const result = await getAllPatients()
    if (!result.success) return { exists: false }
    
    const existingPatient = result.patients.find(p => p.patientEmail === email)
    
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
    
    const patient = result.patients.find(p => p.bookingToken === bookingToken)
    
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
    
    // Delete all JSON files
    try {
      await fs.unlink(PATIENTS_FILE)
      deleted++
    } catch {}
    
    // Delete medical data directory
    try {
      const medicalFiles = await fs.readdir(MEDICAL_DIR)
      for (const file of medicalFiles) {
        await fs.unlink(path.join(MEDICAL_DIR, file))
        deleted++
      }
    } catch {}
    
    console.log(`🗑️ Deleted ${deleted} files`)
    
    return { success: true, deleted }
    
  } catch (error: any) {
    console.error('❌ Failed to delete test data:', error)
    return { success: false, deleted: 0, error: error.message }
  }
}

// Hilfsfunktionen
function getSessionCountFromPackage(sessionPackage: any): number {
  console.log('🔍 DEBUG getSessionCountFromPackage:', {
    id: sessionPackage.id,
    name: sessionPackage.name,
    packageData: sessionPackage
  })
  
  if (sessionPackage.id) {
    console.log('🎯 Using ID-based logic for:', sessionPackage.id)
    switch (sessionPackage.id) {
      case 'consultation': return 1
      case 'single-session': return 1
      case 'four-sessions': return 4
      case 'six-sessions': console.log('✅ Found six-sessions, returning 6'); return 6
      case 'couples-session': return 1
      default: console.log('❌ Unknown ID, defaulting to 1'); return 1
    }
  }
  
  // Fallback: Aus dem Namen ableiten (reihenfolge wichtig!)
  const name = sessionPackage.name?.toLowerCase() || ''
  if (name.includes('consultation')) return 1
  if (name.includes('6')) return 6  // 6 vor 4 prüfen!
  if (name.includes('4')) return 4
  if (name.includes('8')) return 8
  return 1
}

// Separate function for correct session counting
function getCorrectSessionCount(sessionPackage: any): number {
  // Direct ID matching first
  if (sessionPackage.id === 'six-sessions') return 6
  if (sessionPackage.id === 'four-sessions') return 4  
  if (sessionPackage.id === 'consultation') return 1
  if (sessionPackage.id === 'single-session') return 1
  if (sessionPackage.id === 'couples-session') return 1
  
  // Name-based fallback
  const name = sessionPackage.name?.toLowerCase() || ''
  if (name.includes('6 therapy')) return 6
  if (name.includes('4 therapy')) return 4
  if (name.includes('consultation')) return 1
  
  console.log('⚠️ Unknown session package:', sessionPackage)
  return 1
}

function generateDataHash(data: any): string {
  // Einfacher Hash für Datenintegrität
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}