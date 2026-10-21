import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation as useI18nextTranslation, I18nextProvider } from 'react-i18next';
import { Language } from '../types';
import { en } from './en';
import { te } from './te';
import { hi } from './hi';

export type TranslationKey = keyof typeof en;

// Safe retrieval of stored language with valid fallback
const getSavedLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lifemap_language') as Language;
    if (saved === 'en' || saved === 'te' || saved === 'hi') {
      return saved;
    }
  }
  return 'en';
};

const initialLanguage = getSavedLanguage();

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        te: { translation: te },
        hi: { translation: hi },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React handles escaping
      },
    });
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

export { i18n };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
  i18n: typeof i18n;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<Language>(initialLanguage);

  const setLanguage = (lang: Language) => {
    setCurrentLang(lang);
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifemap_language', lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      const valid = (lng === 'te' || lng === 'hi') ? (lng as Language) : 'en';
      setCurrentLang(valid);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = valid;
      }
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  const t = (key: string, options?: any): string => {
    const translation = i18n.t(key, options);
    // If react-i18next returns the key itself because it didn't find it in current lang,
    // fallback to English resource dictionary if present
    if (translation === key) {
      const enDict = en as Record<string, string>;
      if (enDict[key]) return enDict[key];
    }
    return translation as string;
  };

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={{ language: currentLang, setLanguage, t, i18n }}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context) {
    return context;
  }
  // Fallback to react-i18next directly if outside provider
  const { t: _i18n_t, i18n: hook_i18n } = useI18nextTranslation();
  const lang = (hook_i18n.language as Language) || 'en';
  return {
    language: lang,
    setLanguage: (newLang: Language) => {
      hook_i18n.changeLanguage(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lifemap_language', newLang);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    },
    t: (key: string, options?: any): string => {
      const val = hook_i18n.t(key, options);
      if (val === key) {
        const enDict = en as Record<string, string>;
        if (enDict[key]) return enDict[key];
      }
      return val as string;
    },
    i18n: hook_i18n as typeof i18n,
  };
};
