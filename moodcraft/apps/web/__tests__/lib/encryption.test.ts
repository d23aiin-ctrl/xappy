/**
 * CereBro Web App - Encryption Tests
 *
 * Tests for AES-256 encryption/decryption of sensitive data.
 */
import { encrypt, decrypt, tokenizeUserId, hashHMAC } from '@/lib/encryption';

describe('Encryption', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext (due to IV)', () => {
      const plaintext = 'Test message';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = 'Special chars: !@#$%^&*()_+-=[]{}|;:",./<>?`~';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = 'Unicode: 你好世界 🌍 مرحبا العالم';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long text', () => {
      const plaintext = 'A'.repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle newlines and whitespace', () => {
      const plaintext = 'Line 1\nLine 2\n\tTabbed\n  Spaced';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle JSON strings', () => {
      const plaintext = JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } });
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(plaintext));
    });
  });

  describe('tokenizeUserId', () => {
    it('should produce consistent hash for same input', () => {
      const userId = 'user-123';
      const hash1 = tokenizeUserId(userId);
      const hash2 = tokenizeUserId(userId);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different inputs', () => {
      const hash1 = tokenizeUserId('user-123');
      const hash2 = tokenizeUserId('user-456');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce fixed-length hash', () => {
      const hash1 = tokenizeUserId('short');
      const hash2 = tokenizeUserId('a'.repeat(1000));

      // SHA-256 produces 64-character hex string
      expect(hash1.length).toBe(64);
      expect(hash2.length).toBe(64);
    });

    it('should not be reversible', () => {
      const userId = 'sensitive-user-id';
      const hash = tokenizeUserId(userId);

      // Hash should not contain original value
      expect(hash).not.toContain(userId);
      expect(hash).not.toContain('sensitive');
    });

    it('should produce hex string', () => {
      const hash = tokenizeUserId('test');

      // Should only contain hex characters
      expect(/^[0-9a-f]+$/i.test(hash)).toBe(true);
    });
  });

  describe('hashHMAC', () => {
    it('should produce consistent hash with same secret', () => {
      const data = 'test-data';
      const secret = 'test-secret';
      const hash1 = hashHMAC(data, secret);
      const hash2 = hashHMAC(data, secret);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash with different data', () => {
      const secret = 'test-secret';
      const hash1 = hashHMAC('data1', secret);
      const hash2 = hashHMAC('data2', secret);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hash with different secrets', () => {
      const data = 'test-data';
      const hash1 = hashHMAC(data, 'secret1');
      const hash2 = hashHMAC(data, 'secret2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Security properties', () => {
    it('encrypted text should not contain plaintext', () => {
      const plaintext = 'secret_password_123';
      const encrypted = encrypt(plaintext);

      expect(encrypted).not.toContain(plaintext);
      expect(encrypted).not.toContain('secret');
      expect(encrypted).not.toContain('password');
    });

    it('encrypted text should be hex encoded with colon separators', () => {
      const plaintext = 'test';
      const encrypted = encrypt(plaintext);

      // Format should be iv:tag:ciphertext (all hex)
      const parts = encrypted.split(':');
      expect(parts.length).toBe(3);
      parts.forEach((part) => {
        expect(/^[0-9a-f]+$/i.test(part)).toBe(true);
      });
    });
  });
});
