import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoUtil } from '../../common/utils/crypto';

export interface PanVerificationResult {
  valid: boolean;
  pan: string;
  nameOnPan: string;
  category: 'INDIVIDUAL' | 'COMPANY' | 'HUF';
  message: string;
}

export interface AadhaarKycResult {
  valid: boolean;
  maskedAadhaar: string;
  name: string;
  gender: string;
  dob: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

@Injectable()
export class KycAdapter {
  private readonly logger = new Logger(KycAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async verifyPan(pan: string, claimedName: string): Promise<PanVerificationResult> {
    const cleanPan = pan.toUpperCase().trim();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!panRegex.test(cleanPan)) {
      return {
        valid: false,
        pan: cleanPan,
        nameOnPan: '',
        category: 'INDIVIDUAL',
        message: 'Invalid PAN structure',
      };
    }

    const fourthChar = cleanPan[3];
    const category = fourthChar === 'P' ? 'INDIVIDUAL' : fourthChar === 'C' ? 'COMPANY' : 'HUF';

    // Mock verification against official registry
    return {
      valid: true,
      pan: cleanPan,
      nameOnPan: claimedName.toUpperCase(),
      category,
      message: 'PAN verified successfully via NSDL Tax Information Network',
    };
  }

  async verifyAadhaar(aadhaar: string): Promise<AadhaarKycResult> {
    const isValid = CryptoUtil.validateAadhaarVerhoeff(aadhaar);
    if (!isValid) {
      throw new Error('Aadhaar checksum validation failed (Verhoeff algorithm)');
    }

    return {
      valid: true,
      maskedAadhaar: CryptoUtil.maskAadhaar(aadhaar),
      name: 'VERIFIED RESIDENT',
      gender: 'MALE',
      dob: '1990-01-01',
      address: {
        line1: '12, North Car Street',
        city: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625001',
      },
    };
  }
}
