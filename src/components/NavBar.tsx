// src/components/Navbar.tsx
// VERSÃO FINAL - SEM NENHUMA TAG <a>

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Home,
  FileText,
  Shield,
  ChevronDown,
  Globe
} from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { data: session, status } = useSession();
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const languages = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === router.locale);

  const isActiveTab = (tabName: string, path?: string) => {
    if (activeTab) {
      return activeTab === tabName;
    }
    if (path) {
      return router.pathname === path || router.pathname.startsWith(path + '/');
    }
    return false;
  };

  const getLinkClasses = (tabName: string, path?: string) => {
    const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105";
    const isActive = isActiveTab(tabName, path);
    
    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-300 border border-purple-500/50 shadow-lg shadow-purple-500/20`;
    } else {
      return `${baseClasses} ${
        scrolled 
          ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-900/20' 
          : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`;
    }
  };

  const getMobileLinkClasses = (tabName: string, path?: string) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200";
    const isActive = isActiveTab(tabName, path);
    
    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-300 border border-purple-500/50`;
    } else {
      return `${baseClasses} ${
        scrolled 
          ? 'text-slate-300 hover:bg-purple-900/20' 
          : 'text-slate-300 hover:bg-white/10'
      }`;
    }
  };

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
    setIsLanguageOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
      setIsProfileOpen(false);
      setIsLanguageOpen(false);
    };
    if (isOpen || isProfileOpen || isLanguageOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, isProfileOpen, isLanguageOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const UserAvatar = ({ size = 'w-8 h-8', showBorder = true }) => {
    const userImage = session?.user?.image;
    
    if (userImage) {
      return (
        <div className={`${size} relative ${showBorder ? 'ring-2 ring-purple-500/30' : ''} rounded-full overflow-hidden`}>
          <img 
            src={userImage} 
            alt={session?.user?.name || t('profile')}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      );
    }
    
    return (
      <div className={`${size} bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center ${showBorder ? 'ring-2 ring-purple-500/30' : ''}`}>
        <User className="w-4 h-4 text-white" />
      </div>
    );
  };

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-purple-900/30' 
          : 'bg-gradient-to-r from-slate-800 via-slate-900 to-gray-900 shadow-xl'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          
          {/* Logo - SEM tag <a> */}
          <Link 
            href="/" 
            className={`text-2xl lg:text-3xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              scrolled 
                ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent' 
                : 'text-white'
            }`}
          >
            <Crown className="w-6 h-6 lg:w-8 lg:h-8" />
            Clubes Abex
          </Link>

          {/* Desktop Navigation - TODOS SEM tags <a> */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/"
              className={getLinkClasses('home', '/')}
            >
              <Home className="w-4 h-4" />
              {t('home')}
            </Link>

            {status === 'authenticated' && (
              <>
                {session.user?.role === 'admin' && (
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/admin/dashboard"
                      className={getLinkClasses('admin-dashboard', '/admin/dashboard')}
                    >
                      <Shield className="w-4 h-4" />
                      {t('dashboard')}
                    </Link>
                    <Link 
                      href="/admin/planos"
                      className={getLinkClasses('admin-plans', '/admin/planos')}
                    >
                      <Settings className="w-4 h-4" />
                      {t('plans') || 'Planos'}
                    </Link>
                    <Link 
                      href="/admin/conteudo"
                      className={getLinkClasses('admin-content', '/admin/conteudo')}
                    >
                      <FileText className="w-4 h-4" />
                      {t('content') || 'Conteúdo'}
                    </Link>
                  </div>
                )}

                <Link 
                  href="/membro/planos"
                  className={getLinkClasses('member-plans', '/membro/planos')}
                >
                  <Crown className="w-4 h-4" />
                  {t('myPlans') || 'Meus Planos'}
                </Link>

                <Link 
                  href="/membro/conteudo"
                  className={getLinkClasses('member-content', '/membro/conteudo')}
                >
                  <FileText className="w-4 h-4" />
                  {t('exclusiveContent') || 'Conteúdo Exclusivo'}
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileOpen(!isProfileOpen);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      scrolled 
                        ? 'text-slate-300 hover:bg-purple-900/20' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <UserAvatar />
                    <span className="hidden xl:block max-w-24 truncate">
                      {session.user?.name || session.user?.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <UserAvatar size="w-10 h-10" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {session.user?.name || t('user') || 'Usuário'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        {session.user?.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {t('administrator') || 'Administrador'}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLanguageOpen(!isLanguageOpen);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  scrolled 
                    ? 'text-slate-300 hover:bg-purple-900/20' 
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden xl:block">{currentLanguage?.flag}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 hover:bg-slate-700/50 ${
                        router.locale === language.code 
                          ? 'text-purple-400 bg-purple-900/20' 
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {status !== 'authenticated' && (
              <Link 
                href="/auth/signin"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                {t('signIn') || 'Entrar'}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
              scrolled 
                ? 'text-slate-300 hover:bg-purple-900/20' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation - TODOS SEM tags <a> */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <Link 
                href="/"
                className={getMobileLinkClasses('home', '/')}
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-5 h-5" />
                {t('home')}
              </Link>

              {status === 'authenticated' ? (
                <>
                  {session.user?.role === 'admin' && (
                    <>
                      <Link 
                        href="/admin/dashboard"
                        className={getMobileLinkClasses('admin-dashboard', '/admin/dashboard')}
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="w-5 h-5" />
                        {t('dashboard')}
                      </Link>
                      <Link 
                        href="/admin/planos"
                        className={getMobileLinkClasses('admin-plans', '/admin/planos')}
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        {t('managePlans') || 'Gerenciar Planos'}
                      </Link>
                      <Link 
                        href="/admin/conteudo"
                        className={getMobileLinkClasses('admin-content', '/admin/conteudo')}
                        onClick={() => setIsOpen(false)}
                      >
                        <FileText className="w-5 h-5" />
                        {t('manageContent') || 'Gerenciar Conteúdo'}
                      </Link>
                    </>
                  )}

                  <Link 
                    href="/membro/planos"
                    className={getMobileLinkClasses('member-plans', '/membro/planos')}
                    onClick={() => setIsOpen(false)}
                  >
                    <Crown className="w-5 h-5" />
                    {t('myPlans') || 'Meus Planos'}
                  </Link>

                  <Link 
                    href="/membro/conteudo"
                    className={getMobileLinkClasses('member-content', '/membro/conteudo')}
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText className="w-5 h-5" />
                    {t('exclusiveContent') || 'Conteúdo Exclusivo'}
                  </Link>

                  {/* Language Selector - Mobile */}
                  <div className={`px-4 py-3 rounded-lg ${
                    scrolled ? 'bg-purple-900/20' : 'bg-white/10'
                  }`}>
                    <p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {t('language') || 'Idioma'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            changeLanguage(language.code);
                            setIsOpen(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                            router.locale === language.code 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                          }`}
                        >
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* User info mobile */}
                  <div className={`px-4 py-3 rounded-lg ${
                    scrolled ? 'bg-purple-900/20' : 'bg-white/10'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <UserAvatar size="w-10 h-10" showBorder={false} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {session.user?.name || session.user?.email}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    {session.user?.role === 'admin' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {t('administrator') || 'Administrador'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth/signin"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  {t('signIn') || 'Entrar'}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;