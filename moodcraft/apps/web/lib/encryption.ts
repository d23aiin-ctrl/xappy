import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const ENCODING: BufferEncoding = 'hex';

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  // Key should be 32 bytes (64 hex characters) for AES-256
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  // If not hex, derive a 32-byte key
  return crypto.createHash('sha256').update(key).digest();
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
  encrypted += cipher.final(ENCODING);

  const tag = cipher.getAuthTag();

  // Format: iv:tag:ciphertext (all hex)
  return `${iv.toString(ENCODING)}:${tag.toString(ENCODING)}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], ENCODING);
  const tag = Buffer.from(parts[1], ENCODING);
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function hashHMAC(data: string, secret?: string): string {
  const hmacSecret = secret || process.env.INSURANCE_HMAC_SECRET;
  if (!hmacSecret) {
    throw new Error('HMAC secret is required');
  }
  return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
}

export function tokenizeUserId(userId: string): string {
  return hashHMAC(userId);
}
