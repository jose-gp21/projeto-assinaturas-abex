import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    home: 'Início',
    plans: 'Planos',
    content: 'Conteúdo Exclusivo',
    dashboard: 'Painel',
    signIn: 'Entrar',
    signOut: 'Sair',
    settings: 'Configurações',
    admin: 'Administrador',
  },
  en: {
    home: 'Home',
    plans: 'Plans',
    content: 'Exclusive Content',
    dashboard: 'Dashboard',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    settings: 'Settings',
    admin: 'Administrator',
  },
  es: {
    home: 'Inicio',
    plans: 'Planes',
    content: 'Contenido Exclusivo',
    dashboard: 'Panel',
    signIn: 'Iniciar Sesión',
    signOut: 'Cerrar Sesión',
    settings: 'Configuraciones',
    admin: 'Administrador',
  },
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
