import { Schema } from 'mongoose';
import { CryptoUtil } from '../../common/utils/crypto';

export interface EncryptionPluginOptions {
  fields: string[];
  encryptionKeyHex: string;
}

export function encryptionPlugin(schema: Schema, options: EncryptionPluginOptions) {
  schema.pre('save', function (next) {
    const doc = this as any;
    for (const field of options.fields) {
      if (doc.isModified(field) && doc[field] && typeof doc[field] === 'string') {
        // Only encrypt if not already base64 encrypted payload
        if (!doc[field].startsWith('ENC::')) {
          const cipherText = CryptoUtil.encrypt(doc[field], options.encryptionKeyHex);
          doc[field] = `ENC::${cipherText}`;
        }
      }
    }
    next();
  });

  schema.methods.getDecryptedField = function (field: string): string {
    const value = this[field];
    if (!value || typeof value !== 'string') return '';
    if (value.startsWith('ENC::')) {
      const rawPayload = value.slice(5);
      return CryptoUtil.decrypt(rawPayload, options.encryptionKeyHex);
    }
    return value;
  };
}
