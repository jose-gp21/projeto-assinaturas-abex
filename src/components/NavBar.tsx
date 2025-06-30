// src/components/Navbar.tsx
// FINAL VERSION - WITH LOGIN LOADER

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
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
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

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

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setIsOpen(false); // Fechar menu mobile se estiver aberto
    
    // Navegar para página de login
    router.push('/auth/signin').finally(() => {
      // Reset loader após navegação completar
      setTimeout(() => setIsLoginLoading(false), 500);
    });
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
    };
    if (isOpen || isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, isProfileOpen]);

  // Reset login loading when status changes
  useEffect(() => {
    if (status === 'authenticated' || status === 'unauthenticated') {
      setIsLoginLoading(false);
    }
  }, [status]);

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
            alt={session?.user?.name || 'Profile'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full items-center justify-center">
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

  const LoginButton = ({ isMobile = false }) => {
    const baseClasses = isMobile 
      ? "block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:from-purple-700 hover:to-blue-700"
      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg";
    
    return (
      <button
        onClick={handleLoginClick}
        disabled={isLoginLoading}
        className={`${baseClasses} ${isLoginLoading ? 'opacity-80 cursor-not-allowed' : ''} flex items-center justify-center gap-2`}
      >
        {isLoginLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          'Sign In'
        )}
      </button>
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
            className={`text-2xl lg:text-3xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              scrolled 
                ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent' 
                : 'text-white'
            }`}
          >
            <Crown className="w-6 h-6 lg:w-8 lg:h-8" />
            Abex Clubs
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/"
              className={getLinkClasses('home', '/')}
            >
              <Home className="w-4 h-4" />
              Home
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
                      Dashboard
                    </Link>
                    <Link 
                      href="/admin/plans"
                      className={getLinkClasses('admin-plans', '/admin/plans')}
                    >
                      <Settings className="w-4 h-4" />
                      Plans
                    </Link>
                    <Link 
                      href="/admin/content"
                      className={getLinkClasses('admin-content', '/admin/content')}
                    >
                      <FileText className="w-4 h-4" />
                      Content
                    </Link>
                  </div>
                )}

                <Link 
                  href="/member/plans"
                  className={getLinkClasses('member-plans', '/member/plans')}
                >
                  <Crown className="w-4 h-4" />
                  My Plans
                </Link>

                <Link 
                  href="/member/content"
                  className={getLinkClasses('member-content', '/member/content')}
                >
                  <FileText className="w-4 h-4" />
                  Exclusive Content
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
                              {session.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        {session.user?.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Administrator
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {status !== 'authenticated' && <LoginButton />}
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
                className={getMobileLinkClasses('home', '/')}
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-5 h-5" />
                Home
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
                        Dashboard
                      </Link>
                      <Link 
                        href="/admin/plans"
                        className={getMobileLinkClasses('admin-plans', '/admin/plans')}
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        Manage Plans
                      </Link>
                      <Link 
                        href="/admin/content"
                        className={getMobileLinkClasses('admin-content', '/admin/content')}
                        onClick={() => setIsOpen(false)}
                      >
                        <FileText className="w-5 h-5" />
                        Manage Content
                      </Link>
                    </>
                  )}

                  <Link 
                    href="/member/plans"
                    className={getMobileLinkClasses('member-plans', '/member/plans')}
                    onClick={() => setIsOpen(false)}
                  >
                    <Crown className="w-5 h-5" />
                    My Plans
                  </Link>

                  <Link 
                    href="/member/content"
                    className={getMobileLinkClasses('member-content', '/member/content')}
                    onClick={() => setIsOpen(false)}
                  >
                    <FileText className="w-5 h-5" />
                    Exclusive Content
                  </Link>

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
                        Administrator
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <LoginButton isMobile={true} />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;