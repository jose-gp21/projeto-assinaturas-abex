'use client'
// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
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
  ChevronDown
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
      setIsProfileOpen(false);
    };
    if (isOpen || isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, isProfileOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Component para o avatar do usuário
  const UserAvatar = ({ size = 'w-8 h-8', showBorder = true }) => {
    const userImage = session?.user?.image;
    
    if (userImage) {
      return (
        <div className={`${size} relative ${showBorder ? 'ring-2 ring-purple-500/30' : ''} rounded-full overflow-hidden`}>
          <img 
            src={userImage} 
            alt={session?.user?.name || 'Usuário'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback para ícone se a imagem falhar ao carregar
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
          
          {/* Logo */}
          <Link 
            href="/" 
            className={`text-2xl lg:text-3xl font-bold transition-all duration-300 hover:scale-105 ${
              scrolled 
                ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent' 
                : 'text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Crown className="w-6 h-6 lg:w-8 lg:h-8" />
              Clubes Abex
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                scrolled 
                  ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-900/20' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              Início
            </Link>

            {status === 'authenticated' && (
              <>
                {session.user?.role === 'admin' && (
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/admin/dashboard" 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                        scrolled 
                          ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-900/20' 
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link 
                      href="/admin/planos" 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                        scrolled 
                          ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-900/20' 
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Planos
                    </Link>
                    <Link 
                      href="/admin/conteudo" 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                        scrolled 
                          ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-900/20' 
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Conteúdo
                    </Link>
                  </div>
                )}

                <Link 
                  href="/membro/planos" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    scrolled 
                      ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-900/20' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  Meus Planos
                </Link>

                <Link 
                  href="/membro/conteudo" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    scrolled 
                      ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-900/20' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Conteúdo Exclusivo
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

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <UserAvatar size="w-10 h-10" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {session.user?.name || 'Usuário'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        {session.user?.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Administrador
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {status !== 'authenticated' && (
              <Link 
                href="/auth/signin"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Entrar
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

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <Link 
                href="/" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  scrolled 
                    ? 'text-slate-300 hover:bg-purple-900/20' 
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-5 h-5" />
                Início
              </Link>

              {status === 'authenticated' ? (
                <>
                  {session.user?.role === 'admin' && (
                    <>
                      <Link 
                        href="/admin/dashboard" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                          scrolled 
                            ? 'text-slate-300 hover:bg-purple-900/20' 
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="w-5 h-5" />
                        Dashboard
                      </Link>
                      <Link 
                        href="/admin/planos" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                          scrolled 
                            ? 'text-slate-300 hover:bg-purple-900/20' 
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        Gerenciar Planos
                      </Link>
                      <Link 
                        href="/admin/conteudo" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                          scrolled 
                            ? 'text-slate-300 hover:bg-purple-900/20' 
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <FileText className="w-5 h-5" />
                        Gerenciar Conteúdo
                      </Link>
                    </>
                  )}

                  <Link 
                    href="/membro/planos" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      scrolled 
                        ? 'text-slate-300 hover:bg-purple-900/20' 
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Crown className="w-5 h-5" />
                    Meus Planos
                  </Link>

                  <Link 
                    href="/membro/conteudo" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      scrolled 
                        ? 'text-slate-300 hover:bg-purple-900/20' 
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText className="w-5 h-5" />
                    Conteúdo Exclusivo
                  </Link>

                  {/* User info mobile */}
                  <div className={`px-4 py-3 rounded-lg ${
                    scrolled ? 'bg-purple-900/20' : 'bg-white/10'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <UserAvatar size="w-10 h-10" showBorder={false} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          scrolled ? 'text-white' : 'text-white'
                        }`}>
                          {session.user?.name || session.user?.email}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    {session.user?.role === 'admin' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Administrador
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth/signin"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => setIsOpen(false)}
                >
                  Entrar
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