'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (fr: string, en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    // Gérer la direction du texte pour l'arabe
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
  };

  const t = (fr: string, en: string, ar: string) => {
    return lang === 'fr' ? fr : lang === 'en' ? en : ar;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
