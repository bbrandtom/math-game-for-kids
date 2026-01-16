import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import he from './locales/he.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'he', name: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
] as const;

export type LanguageCode = (typeof languages)[number]['code'];

// Get saved language or detect from browser
function getInitialLanguage(): LanguageCode {
  const saved = localStorage.getItem('pokemon-math-language');
  if (saved && languages.some((l) => l.code === saved)) {
    return saved as LanguageCode;
  }

  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0];
  const match = languages.find((l) => l.code === browserLang);
  return match ? match.code : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
    ar: { translation: ar },
    fr: { translation: fr },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  const language = languages.find((l) => l.code === lng);
  if (language) {
    document.documentElement.dir = language.dir;
    document.documentElement.lang = lng;
    localStorage.setItem('pokemon-math-language', lng);
  }
});

// Set initial direction
const initialLang = languages.find((l) => l.code === i18n.language);
if (initialLang) {
  document.documentElement.dir = initialLang.dir;
  document.documentElement.lang = i18n.language;
}

export default i18n;
