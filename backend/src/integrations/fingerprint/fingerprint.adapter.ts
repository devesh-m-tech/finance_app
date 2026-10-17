import { Injectable, Logger } from '@nestjs/common';
import { CryptoUtil } from '../../common/utils/crypto';

export interface FingerprintMatchResult {
  matched: boolean;
  score: number; // 0 to 100
  quality: number; // 0 to 100
  deviceModel: string;
}

@Injectable()
export class FingerprintAdapter {
  private readonly logger = new Logger(FingerprintAdapter.name);
  private static readonly MATCH_THRESHOLD = 60;

  /**
   * Generates a secure hash of the biometric minutiae template.
   */
  hashTemplate(base64IsoTemplate: string): string {
    return CryptoUtil.hashSensitive(base64IsoTemplate);
  }

  /**
   * Compares captured live template against stored customer template.
   */
  async matchTemplates(
    capturedBase64: string,
    storedBase64: string,
    deviceModel = 'Mantra MFS100'
  ): Promise<FingerprintMatchResult> {
    // If identical templates
    if (capturedBase64 === storedBase64) {
      return {
        matched: true,
        score: 98,
        quality: 95,
        deviceModel,
      };
    }

    // Hash comparison fallback:
    const hash1 = this.hashTemplate(capturedBase64);
    const hash2 = this.hashTemplate(storedBase64);

    if (hash1 === hash2) {
      return {
        matched: true,
        score: 95,
        quality: 90,
        deviceModel,
      };
    }

    // Simulated minutiae comparison algorithm
    const len = Math.min(capturedBase64.length, storedBase64.length);
    let commonChars = 0;
    for (let i = 0; i < len; i++) {
      if (capturedBase64[i] === storedBase64[i]) {
        commonChars++;
      }
    }

    const similarity = Math.round((commonChars / len) * 100);
    const score = Math.min(100, Math.max(20, similarity));

    return {
      matched: score >= FingerprintAdapter.MATCH_THRESHOLD,
      score,
      quality: 85,
      deviceModel,
    };
  }
}
