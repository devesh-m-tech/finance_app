import en from './en.json';
import ta from './ta.json';

export type SupportedLanguage = 'en' | 'ta';

const translations: Record<SupportedLanguage, typeof en> = {
  en,
  ta,
};

let currentLanguage: SupportedLanguage = 'en';

export function setLanguage(lang: SupportedLanguage): void {
  currentLanguage = lang;
}

export function getLanguage(): SupportedLanguage {
  return currentLanguage;
}

/**
 * Type-safe path translation helper.
 * e.g., t('app.name') -> 'SHRI AMUDHA SMALL FINANCE'
 */
export function t(key: string, lang: SupportedLanguage = currentLanguage): string {
  const dict = translations[lang] || translations.en;
  const parts = key.split('.');
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return key; // fallback to key
    }
  }

  return typeof current === 'string' ? current : key;
}

export { en, ta };
