import crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16  // 128 bits
const TAG_LENGTH = 16 // 128 bits

// Get encryption key from environment variable
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    // For development, use a default key
    if (process.env.NODE_ENV === 'development') {
      return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex')
    }
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }
  
  // Ensure key is 32 bytes (256 bits)
  if (key.length !== 64) { // 32 bytes = 64 hex characters
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (256 bits)')
  }
  
  return Buffer.from(key, 'hex')
}

// Generate a new encryption key (for setup)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

// Encrypt sensitive data
export function encryptData(plaintext: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    
    const cipher = crypto.createCipherGCM(ALGORITHM, key, iv)
    cipher.setAAD(Buffer.from('katyusha-therapy-data', 'utf8'))
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    // Combine IV + encrypted data + auth tag
    const combined = iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex')
    
    return combined
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`)
  }
}

// Decrypt sensitive data
export function decryptData(encryptedData: string): string {
  try {
    const key = getEncryptionKey()
    const parts = encryptedData.split(':')
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const tag = Buffer.from(parts[2], 'hex')
    
    const decipher = crypto.createDecipherGCM(ALGORITHM, key, iv)
    decipher.setAAD(Buffer.from('katyusha-therapy-data', 'utf8'))
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

// Hash sensitive data (one-way, for comparison)
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Encrypt medical form data
export function encryptMedicalData(medicalData: any): string {
  const jsonString = JSON.stringify(medicalData)
  return encryptData(jsonString)
}

// Decrypt medical form data
export function decryptMedicalData(encryptedData: string): any {
  const jsonString = decryptData(encryptedData)
  return JSON.parse(jsonString)
}

// Secure random token generation
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Validate data integrity with HMAC
export function createDataSignature(data: string): string {
  const key = getEncryptionKey()
  return crypto.createHmac('sha256', key).update(data).digest('hex')
}

export function verifyDataSignature(data: string, signature: string): boolean {
  const expectedSignature = createDataSignature(data)
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export default {
  encryptData,
  decryptData,
  hashData,
  encryptMedicalData,
  decryptMedicalData,
  generateSecureToken,
  generateEncryptionKey,
  createDataSignature,
  verifyDataSignature
}