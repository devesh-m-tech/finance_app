import * as crypto from 'crypto';

export class CryptoUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly TAG_LENGTH = 16;

  /**
   * Encrypts plaintext using AES-256-GCM.
   * Returns base64 payload containing IV + Auth Tag + Ciphertext.
   */
  static encrypt(plaintext: string, keyHex: string): string {
    const key = Buffer.from(keyHex.slice(0, 64), 'hex');
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    // Pack IV + Tag + Encrypted data
    const packed = Buffer.concat([iv, tag, encrypted]);
    return packed.toString('base64');
  }

  /**
   * Decrypts AES-256-GCM base64 packed payload.
   */
  static decrypt(base64Payload: string, keyHex: string): string {
    const key = Buffer.from(keyHex.slice(0, 64), 'hex');
    const packed = Buffer.from(base64Payload, 'base64');

    const iv = packed.subarray(0, this.IV_LENGTH);
    const tag = packed.subarray(
      this.IV_LENGTH,
      this.IV_LENGTH + this.TAG_LENGTH
    );
    const ciphertext = packed.subarray(this.IV_LENGTH + this.TAG_LENGTH);

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * Generates deterministic HMAC-SHA256 hash for exact-match indexing.
   */
  static generateDeterministicHash(value: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(value.trim().toUpperCase())
      .digest('hex');
  }

  /**
   * Masks Aadhaar number to XXXX-XXXX-1234 format.
   */
  static maskAadhaar(aadhaar: string): string {
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length !== 12) return 'XXXX-XXXX-XXXX';
    return `XXXX-XXXX-${clean.slice(8)}`;
  }

  /**
   * Masks PAN number to XXXXX1234X.
   */
  static maskPan(pan: string): string {
    const clean = pan.trim().toUpperCase();
    if (clean.length !== 10) return 'XXXXXXXXXX';
    return `XXXXX${clean.slice(5, 9)}${clean.slice(9)}`;
  }

  /**
   * Verhoeff Checksum Algorithm for validating 12-digit Indian Aadhaar numbers.
   */
  static validateAadhaarVerhoeff(aadhaar: string): boolean {
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length !== 12) return false;

    // Multiplication table d
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];

    // Permutation table p
    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];

    let c = 0;
    const reversedDigits = clean.split('').reverse().map(Number);

    for (let i = 0; i < reversedDigits.length; i++) {
      c = d[c][p[i % 8][reversedDigits[i]]];
    }

    return c === 0;
  }
}
