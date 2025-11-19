import React, { createContext, useContext, useState, useEffect } from 'react';
import pt from '../locales/pt.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const translations: Record<string, any> = {
  pt,
  en,
  es,
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'pt',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('pt');
  const [mounted, setMounted] = useState(false);

  // 🔧 CORREÇÃO: Detectar idioma apenas no cliente
  useEffect(() => {
    setMounted(true);
    
    // Detectar idioma salvo ou do navegador
    let detectedLang = 'pt';
    
    if (typeof window !== 'undefined') {
      // 1. Tentar pegar do localStorage
      const savedLang = localStorage.getItem('language');
      if (savedLang && translations[savedLang]) {
        detectedLang = savedLang;
      } else {
        // 2. Detectar do navegador
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('en')) detectedLang = 'en';
        else if (browserLang.startsWith('es')) detectedLang = 'es';
        else detectedLang = 'pt';
      }
    }
    
    setLanguageState(detectedLang);
  }, []);

  // 🔧 CORREÇÃO: Função setLanguage que salva persistentemente
  const setLanguage = (lang: string) => {
    if (!translations[lang]) return;
    
    setLanguageState(lang);
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  // 📝 Função de tradução
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) return key;
    }
    return result || key;
  };

  // 🔧 CORREÇÃO: Não renderizar até montar no cliente (evita flash)
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);