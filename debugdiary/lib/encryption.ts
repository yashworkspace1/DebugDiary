import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

export function hashApiKey(plainKey: string): string {
  return crypto
    .createHash('sha256')
    .update(plainKey)
    .digest('hex')
}

// Generate key + return plain text ONCE
// Store only the hash
export function generateApiKey(): { plain: string; hashed: string } {
  const plain = 'dd_' + crypto.randomBytes(32).toString('hex')
  const hashed = hashApiKey(plain)
  return { plain, hashed }
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted
  ].join(':')
}

export function decrypt(encryptedText: string): string {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
    
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (err) {
    console.error('Decryption failed:', err)
    return ''
  }
}

export function maskPAT(pat: string): string {
  if (!pat || pat.length < 4) return '••••••••'
  return '••••••••' + pat.slice(-4)
}
