// Simple getAllPatients function that returns direct JSON structure
import path from 'path'
import { promises as fs } from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json')

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

export async function loadJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.log(`📄 Datei nicht gefunden oder leer: ${filePath}, verwende Standardwert`)
    return defaultValue
  }
}

export async function getAllPatients(): Promise<{ success: boolean; patients: any[]; error?: string }> {
  try {
    await ensureDirectoryExists(DATA_DIR)
    
    // Direkt aus patients.json lesen - keine Transformation
    const patients = await loadJsonFile<any[]>(PATIENTS_FILE, [])
    
    console.log(`📋 ${patients.length} Patienten aus JSON geladen`)
    
    return { success: true, patients }
    
  } catch (error: any) {
    console.error('❌ Failed to get patients:', error)
    return { success: false, patients: [], error: error.message }
  }
}