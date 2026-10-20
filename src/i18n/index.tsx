import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { en } from './en';
import { te } from './te';
import { hi } from './hi';

type TranslationKey = keyof typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const dictionaries = {
  en,
  te,
  hi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('lifemap_language') as Language;
    if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lifemap_language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => {
    const dict = dictionaries[language] || dictionaries.en;
    return (dict as Record<string, string>)[key] || en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
