// src/pages/auth/signin.tsx
import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import Layout from '@/components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import withAuth from '@/components/withAuth';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Crown, 
  Shield, 
  Sparkles, 
  Users, 
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';

const google_logo: string = require('@/assets/image/google-logo.png');

interface SignInPageProps {
  providers: Awaited<ReturnType<typeof getProviders>>;
}

function SignIn({ providers }: SignInPageProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  // ✨ USAR TRADUÇÕES nas features
  const features = [
    {
      icon: <Crown className="w-5 h-5" />,
      title: t('signin.features.exclusive.title'),
      description: t('signin.features.exclusive.description')
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: t('signin.features.community.title'),
      description: t('signin.features.community.description')
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: t('signin.features.security.title'),
      description: t('signin.features.security.description')
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side - Branding & Features */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="mb-8">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Abex Clubs
                  </h1>
                </div>
                <p className="text-xl text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  {t('signin.subtitle')}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6 mb-8">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg text-purple-400">
                      {feature.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  ))}
                </div>
                <span className="text-sm">
                  {t('signin.stats')}
                </span>
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 rounded-3xl" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-4">
                      <Sparkles className="w-4 h-4" />
                      {t('signin.badge')}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">
                      {t('signin.title')}
                    </h2>
                    <p className="text-slate-400">
                      {t('signin.description')}
                    </p>
                  </div>

                  {/* Google Sign In Button */}
                  {providers && Object.values(providers).map((provider) => {
                    if (provider.id === 'google') {
                      return (
                        <div key={provider.name} className="space-y-6">
                          <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="group w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-gray-200"
                          >
                            {isLoading ? (
                              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                            ) : (
                              <Image 
                                src={google_logo} 
                                alt="Google Logo" 
                                className="w-6 h-6" 
                              />
                            )}
                            <span className="text-lg">
                              {isLoading 
                                ? t('signin.signing')
                                : t('signin.googleButton')
                              }
                            </span>
                            {!isLoading && (
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            )}
                          </button>

                          {/* Benefits */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              {t('signin.benefits.secure')}
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              {t('signin.benefits.instant')}
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              {t('signin.benefits.sync')}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Divider */}
                  <div className="my-8 flex items-center">
                    <div className="flex-1 border-t border-slate-600"></div>
                    <span className="px-4 text-slate-500 text-sm">
                      {t('signin.secureLabel')}
                    </span>
                    <div className="flex-1 border-t border-slate-600"></div>
                  </div>

                  {/* Security note */}
                  <div className="text-center">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t('signin.terms')}{' '}
                      <Link 
                        href="/terms" 
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        {t('signin.termsLink')}
                      </Link>{' '}
                      {t('signin.and')}{' '} 
                      <Link 
                        href="/privacy" 
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        {t('signin.privacyLink')}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional CTA */}
              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  {t('signin.newUser')}{' '} 
                  <span className="text-purple-400 font-medium">
                    {t('signin.autoCreate')} 
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 text-purple-500/20">
          <Crown className="w-8 h-8 animate-bounce" />
        </div>
        <div className="absolute bottom-20 right-10 text-blue-500/20">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="absolute top-1/2 right-20 text-purple-500/20">
          <Star className="w-5 h-5 animate-ping" />
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders();
  return {
    props: { 
      providers,
    },
  };
}

export default withAuth(SignIn, { redirectIfAuthenticated: true });