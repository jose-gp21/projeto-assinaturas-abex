// src/pages/index.tsx
import Layout from '@/components/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { 
  Crown, 
  Shield, 
  Users, 
  Zap, 
  FileText, 
  Video, 
  Calendar, 
  Headphones, 
  BookOpen, 
  Monitor,
  BarChart3,
  Settings,
  Lock,
  Star,
  ArrowRight,
  Check,
  Play,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  Award,
  Globe,
  Smartphone,
  Tablet,
  MessageCircle,
  Quote,
  ChevronRight,
  Edit,
  Search,
  Filter,
  Eye,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
  Twitter
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activePlanPeriod, setActivePlanPeriod] = useState<'monthly' | 'annually'>('monthly');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: "10,000+", label: "Active Members", icon: Users },
    { number: "98%", label: "Customer Satisfaction", icon: Star },
    { number: "500+", label: "Exclusive Content", icon: FileText },
    { number: "24/7", label: "Premium Support", icon: Shield }
  ];

  const features = [
    {
      icon: Crown,
      title: "Exclusive Content",
      description: "Access premium materials and unique experiences designed specifically for our members",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Total Security",
      description: "Your data protected with cutting-edge encryption and advanced security protocols",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "VIP Community",
      description: "Connect with exclusive members and build valuable professional networks",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Immediate access to all content and features as soon as you join",
      color: "from-orange-500 to-red-500"
    }
  ];

  const contentTypes = [
    { 
      icon: FileText, 
      title: "Premium Articles", 
      description: "In-depth content and exclusive insights from industry experts", 
      color: "from-purple-500 to-pink-500" 
    },
    { 
      icon: Video, 
      title: "Exclusive Videos", 
      description: "High-quality video content and masterclasses", 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      icon: Calendar, 
      title: "VIP Events", 
      description: "Exclusive events and networking opportunities", 
      color: "from-green-500 to-emerald-500" 
    },
    { 
      icon: Headphones, 
      title: "Podcasts", 
      description: "Educational podcasts and expert interviews", 
      color: "from-orange-500 to-red-500" 
    },
    { 
      icon: BookOpen, 
      title: "Advanced Courses", 
      description: "Comprehensive learning paths and certifications", 
      color: "from-indigo-500 to-purple-500" 
    },
    { 
      icon: Monitor, 
      title: "Webinars", 
      description: "Live sessions and interactive workshops", 
      color: "from-teal-500 to-blue-500" 
    }
  ];

  const plans = [
    {
      name: "Basic",
      price: { monthly: "29", annually: "299" },
      originalPrice: { monthly: "39", annually: "399" },
      description: "Perfect to get started with exclusive content",
      features: [
        "Access to basic content",
        "Community participation",
        "Email support",
        "Mobile app access"
      ],
      popular: false,
      color: "from-slate-600 to-slate-700"
    },
    {
      name: "Premium",
      price: { monthly: "79", annually: "799" },
      originalPrice: { monthly: "99", annually: "999" },
      description: "Complete access to all premium features",
      features: [
        "Access to all content",
        "Priority support",
        "Exclusive events",
        "Advanced courses",
        "Downloadable resources",
        "1-on-1 mentoring"
      ],
      popular: true,
      color: "from-purple-600 to-blue-600"
    },
    {
      name: "VIP",
      price: { monthly: "149", annually: "1499" },
      originalPrice: { monthly: "199", annually: "1999" },
      description: "The ultimate experience with all benefits",
      features: [
        "Everything from Premium",
        "VIP community access",
        "Personal consultation",
        "Custom content requests",
        "Direct expert access",
        "Certification programs"
      ],
      popular: false,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Marketing Director",
      content: "The exclusive content transformed how I approach my business strategies. Incredible value!",
      rating: 5,
      image: "MS"
    },
    {
      name: "John Smith",
      role: "Entrepreneur",
      content: "The VIP community opened doors I never imagined. The networking alone is worth the investment.",
      rating: 5,
      image: "JS"
    },
    {
      name: "Ana Costa",
      role: "Business Consultant",
      content: "Professional content with practical applicability. I recommend it to all my clients.",
      rating: 5,
      image: "AC"
    }
  ];

  const dashboardFeatures = [
    { 
      title: "Advanced Analytics", 
      description: "Complete insights into your content performance and member engagement", 
      icon: BarChart3 
    },
    { 
      title: "Member Management", 
      description: "Easily manage subscriptions, access levels, and member communications", 
      icon: Users 
    },
    { 
      title: "Content Creation", 
      description: "Intuitive tools to create, edit, and publish exclusive content", 
      icon: Settings 
    },
    { 
      title: "Revenue Optimization", 
      description: "Tools to maximize revenue and optimize your monetization strategy", 
      icon: TrendingUp 
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Layout activeTab="home" >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
        
        {/* Floating Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm font-medium">
                      #1 Platform for Exclusive Content
                    </span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Create Your
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Exclusive Club
                    </span>
                  </h1>
                  
                  <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
                    The complete platform to create, manage, and monetize exclusive content for your members
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {session ? (
                    <a href="/member/content" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25">
                      <Crown className="w-5 h-5" />
                      Access Content
                    </a>
                  ) : (
                    <a href="/auth/signin" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25">
                      <Crown className="w-5 h-5" />
                      Get Started
                    </a>
                  )}
                  
                  <button className="inline-flex items-center justify-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:bg-slate-700/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-8 pt-8">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-slate-400 text-sm ml-2">
                      10,000+ active members
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                    <span className="text-slate-400 text-sm ml-2">4.9/5</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    </div>
                   
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <Video className="w-6 h-6 text-purple-400" />
                          <div>
                            <p className="text-white font-medium">
                              Exclusive Masterclass
                            </p>
                            <p className="text-slate-400 text-sm">
                              Advanced business strategies
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-green-400" />
                          <div>
                            <p className="text-white font-medium">
                              Market Report 2024
                            </p>
                            <p className="text-slate-400 text-sm">
                              Exclusive insights and data
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-orange-400" />
                          <div>
                            <p className="text-white font-medium">
                              VIP Community
                            </p>
                            <p className="text-slate-400 text-sm">
                              Elite networking opportunities
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Choose {' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Abex Clubs
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Discover the features that make our platform the best choice for creating and managing exclusive content
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:border-purple-500/30 h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Types Section */}
        <section id="content" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Diverse Types of {' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Exclusive Content
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Create and share various types of premium content to engage and educate your members
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contentTypes.map((type, index) => (
                <div key={index} className="group">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <type.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{type.title}</h3>
                    <p className="text-slate-400">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="plans" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Choose Your {' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Perfect Plan
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Flexible plans designed to meet your needs and budget
              </p>
              
              <div className="flex items-center justify-center gap-4 mt-8">
                <span className={`text-slate-400 ${activePlanPeriod === 'monthly' ? 'text-white font-semibold' : ''}`}>
                  Monthly
                </span>
                <button
                  className="relative w-14 h-8 bg-slate-700 rounded-full border border-slate-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  onClick={() => setActivePlanPeriod(activePlanPeriod === 'monthly' ? 'annually' : 'monthly')}
                >
                  <span className={`absolute left-1 top-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-md transform transition-transform duration-300 ${
                    activePlanPeriod === 'annually' ? 'translate-x-6' : ''
                  }`}></span>
                </button>
                <span className={`text-slate-400 ${activePlanPeriod === 'annually' ? 'text-white font-semibold' : ''}`}>
                  Annually
                </span>
                <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-sm font-medium">
                  Save 20%
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div key={index} className={`relative group ${plan.popular ? 'scale-105' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white text-sm font-bold shadow-md">
                      Most Popular
                    </div>
                  )}
                  
                  <div className={`bg-slate-800/50 backdrop-blur-sm border ${plan.popular ? 'border-purple-500/50' : 'border-slate-700/50'} rounded-2xl p-8 hover:bg-slate-800/70 transition-all duration-300 group-hover:scale-[1.02] h-full flex flex-col justify-between mt-12`}>
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-slate-400 mb-6">{plan.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-3xl font-bold text-slate-400 line-through">
                            ${plan.originalPrice[activePlanPeriod]}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-4xl font-bold text-white">
                            ${plan.price[activePlanPeriod]}
                          </span>
                          <span className="text-slate-400">
                            /{activePlanPeriod === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <a href="/member/plans" className={`block w-full py-4 px-6 rounded-xl text-center font-semibold transition-all duration-300 group-hover:scale-105 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}>
                      {session ? 'Upgrade Now' : 'Get Started'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Powerful {' '}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Admin Dashboard
                    </span>
                  </h2>
                  <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    Complete control over your exclusive club with advanced analytics and management tools
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {dashboardFeatures.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl shadow-2xl animate-pulse-subtle">
                {/* Dashboard Mockup */}
                <div className="w-full h-72 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm overflow-hidden relative">
                    <div className="absolute top-4 left-4 flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="w-11/12 h-5/6 bg-slate-900 rounded-lg shadow-inner p-4 flex flex-col gap-2 relative">
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-slate-400 text-xs">
                            <Settings className="w-3 h-3" />
                            <span>Settings</span>
                        </div>
                        <div className="h-6 bg-slate-800 rounded mb-4"></div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1 h-24 bg-gradient-to-br from-purple-700 to-blue-700 rounded-md"></div>
                            <div className="col-span-2 h-24 bg-slate-700 rounded-md"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="h-32 bg-slate-700 rounded-md"></div>
                            <div className="h-32 bg-slate-700 rounded-md"></div>
                        </div>
                        <div className="flex justify-end gap-2 mt-auto">
                            <div className="w-16 h-6 bg-slate-700 rounded-md"></div>
                            <div className="w-16 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md"></div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Management Preview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Easy Content {' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Management
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Create, organize, and publish your exclusive content with our intuitive management system
              </p>
            </div>
            <div className="relative p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl shadow-2xl animate-fade-in">
              <div className="w-full h-80 bg-slate-900 rounded-xl flex flex-col p-6 shadow-inner relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-8 bg-slate-700 rounded-md"></div>
                    <div className="w-24 h-8 bg-slate-700 rounded-md"></div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700 rounded-md px-3 py-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search content..." className="bg-transparent text-slate-300 outline-none w-40" />
                  </div>
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-800 rounded-xl p-4 flex flex-col justify-between border border-slate-700/50 hover:border-purple-500/50 transition-colors duration-300">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Market Analysis 2024
                      </h4>
                      <p className="text-slate-400 text-sm mb-3 truncate">
                        Complete report on current market trends and opportunities
                      </p>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <FileText className="w-3 h-3" />
                        <span>Published</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 ml-auto"></div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button className="text-blue-400 hover:text-blue-500 text-sm">
                        Edit
                      </button>
                      <button className="text-red-400 hover:text-red-500 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 flex flex-col justify-between border border-slate-700/50 hover:border-purple-500/50 transition-colors duration-300">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Leadership Masterclass
                      </h4>
                      <p className="text-slate-400 text-sm mb-3 truncate">
                        Exclusive video series on leadership skills development
                      </p>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Video className="w-3 h-3" />
                        <span>Draft</span>
                        <div className="w-2 h-2 rounded-full bg-yellow-500 ml-auto"></div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button className="text-blue-400 hover:text-blue-500 text-sm">
                        Edit
                      </button>
                      <button className="text-red-400 hover:text-red-500 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 flex flex-col justify-between border border-slate-700/50 hover:border-purple-500/50 transition-colors duration-300">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Weekly Business Podcast
                      </h4>
                      <p className="text-slate-400 text-sm mb-3 truncate">
                        Expert interviews and industry insights
                      </p>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Headphones className="w-3 h-3" />
                        <span>Scheduled</span>
                        <div className="w-2 h-2 rounded-full bg-orange-500 ml-auto"></div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button className="text-blue-400 hover:text-blue-500 text-sm">
                        Edit
                      </button>
                      <button className="text-red-400 hover:text-red-500 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                    <Edit className="w-5 h-5" />
                    Add New Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Member Experience Preview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl shadow-2xl animate-pulse-subtle">
                <div className="w-full h-80 bg-slate-900 rounded-xl flex flex-col shadow-inner relative">
                    <div className="w-full h-1/3 bg-gradient-to-r from-purple-700 to-blue-700 rounded-t-xl flex items-center justify-center">
                        <Crown className="w-16 h-16 text-white text-opacity-30" />
                    </div>
                    <div className="flex-grow p-4 space-y-4">
                        <div className="bg-slate-700 rounded-md p-3 flex items-center justify-between">
                            <span className="text-white font-medium">
                              Advanced Business Strategies
                            </span>
                            <Play className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="bg-slate-700 rounded-md p-3 flex items-center justify-between">
                            <span className="text-white font-medium">
                              Exclusive Market Report
                            </span>
                            <Lock className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="bg-slate-700 rounded-md p-3 flex items-center justify-between">
                            <span className="text-white font-medium">
                              VIP Member Webinar
                            </span>
                            <Play className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-10 bg-slate-700 rounded-full flex items-center justify-around text-slate-400 text-sm">
                        <FileText className="w-5 h-5" />
                        <Video className="w-5 h-5" />
                        <Users className="w-5 h-5" />
                        <Settings className="w-5 h-5" />
                    </div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Exceptional {' '}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Member Experience
                    </span>
                  </h2>
                  <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    Your members will enjoy a premium, intuitive experience designed to maximize engagement and satisfaction
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Multi-device Access
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Access from any device, anywhere, anytime
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Restricted Content
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Exclusive content based on membership levels
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Eye className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Clear Interface
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Intuitive and easy-to-navigate design
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials/Social Proof */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                What Our {' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Members Say
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Discover how our platform has transformed businesses and careers around the world
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl -z-10 animate-spin-slow"></div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {testimonials[currentTestimonial].image}
                </div>
                <div className="text-center md:text-left">
                  <Quote className="w-10 h-10 text-purple-400 mb-4 mx-auto md:mx-0" />
                  <p className="text-xl text-slate-300 italic mb-4">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white font-semibold">{testimonials[currentTestimonial].name}</p>
                  <p className="text-slate-400 text-sm">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      index === currentTestimonial ? 'bg-purple-500 scale-125' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer Premium */}
        <footer className="bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 py-16 px-4 sm:px-6 lg:px-8 text-slate-400">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Abex Clubs</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                The complete platform for creating and managing exclusive membership clubs
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-6">
                Navigation
              </h3>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors">
                  Features
                </a></li>
                <li><a href="#content" className="hover:text-white transition-colors">
                  Content
                </a></li>
                <li><a href="#plans" className="hover:text-white transition-colors">
                  Plans
                </a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">
                  Testimonials
                </a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-6">
                Support
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors">
                  FAQs
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors">
                  Contact
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-6">
                Contact
              </h3>
              <address className="not-italic space-y-3">
                <p className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <span>contact@abexclubs.com</span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>+1 (555) 123-4567</span>
                </p>z'
                <p className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span>New York, NY, USA</span>
                </p>
              </address>
            </div>
          </div>

          <div className="border-t border-slate-700/50 mt-12 pt-8 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Abex Clubs. All rights reserved.
          </div>
        </footer>
      </div>
    </Layout>
  );
}