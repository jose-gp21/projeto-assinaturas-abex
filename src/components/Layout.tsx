// src/components/Layout.tsx
// Remover 'use client' se estiver usando Pages Router
import React from 'react';
import Navbar from './NavBar';
import { useTranslation } from 'next-i18next';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab }) => {
  const { t } = useTranslation('common'); // Adicionar hook de tradução

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex flex-col">
      <Navbar activeTab={activeTab} />
      
      {/* Main Content with animated entrance */}
      <main className="flex-grow relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/20 to-transparent pointer-events-none" />
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-white">
          {children}
        </div>
      </main>
      
      {/* Modern Footer com traduções */}
      <footer className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
        
        {/* Footer content */}
        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                Clubes Abex
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t('footer.description') || 'Sua plataforma exclusiva para conteúdo premium e experiências únicas.'}
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="text-center">
              <h4 className="font-semibold text-white mb-3">
                {t('footer.quickLinks') || 'Links Rápidos'}
              </h4>
              <div className="space-y-2 text-sm">
                <a href="/sobre" className="block text-slate-300 hover:text-purple-400 transition-colors duration-200">
                  {t('footer.about') || 'Sobre Nós'}
                </a>
                <a href="/contato" className="block text-slate-300 hover:text-purple-400 transition-colors duration-200">
                  {t('footer.contact') || 'Contato'}
                </a>
                <a href="/suporte" className="block text-slate-300 hover:text-purple-400 transition-colors duration-200">
                  {t('footer.support') || 'Suporte'}
                </a>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold text-white mb-3">
                {t('footer.contactInfo') || 'Contato'}
              </h4>
              <div className="space-y-2 text-sm text-slate-300">
                <p>contato@clubesabex.com</p>
                <p>+55 (11) 9999-9999</p>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} Clubes Abex. {t('footer.allRightsReserved') || 'Todos os direitos reservados.'}
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="/privacidade" className="text-slate-400 hover:text-purple-400 transition-colors duration-200">
                  {t('footer.privacy') || 'Privacidade'}
                </a>
                <a href="/termos" className="text-slate-400 hover:text-purple-400 transition-colors duration-200">
                  {t('footer.terms') || 'Termos de Uso'}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating animation elements */}
        <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-purple-500/20 rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-500/30 rounded-full animate-ping" />
      </footer>
    </div>
  );
};

export default Layout;