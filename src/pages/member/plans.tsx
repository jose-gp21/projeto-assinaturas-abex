'use client'
// src/pages/member/plans.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/router';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { 
  Crown, 
  CheckCircle, 
  X,
  AlertCircle,
  Calendar,
  CreditCard,
  Star,
  Zap,
  Gift,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Play,
  Pause,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface Plan {
  _id: string;
  name: string;
  monthlyPrice?: number;
  annualPrice?: number; 
  description: string;
  // some APIs use `features`, others `benefits` — accept both
  features?: string[];
  benefits?: string[];
  trialDays?: number;
  popular?: boolean;
  active?: boolean;
}

interface Subscription {
  _id: string;
  planId: string;
  plan?: Plan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  nextBillingDate?: string;
  cancellationDate?: string;
  expirationDate?: string;
  amount: number;
  billing: 'monthly' | 'annual';
}

function MyPlansPage() {
  const { language } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mySubscription, setMySubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPlans, resSubscription] = await Promise.all([
        fetch('/api/member/plans'),
        fetch('/api/member/subscription')
      ]);

      const [dataPlans, dataSubscription] = await Promise.all([
        resPlans.json(),
        resSubscription.json()
      ]);

      if (dataPlans.success) {
        setPlans(dataPlans.data);
      } else {
        setError(dataPlans.message);
      }

      if (dataSubscription.success) {
        setMySubscription(dataSubscription.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading plans');
    } finally {
      setLoading(false);
    }
  };

 // Melhorar também o handler de subscribe no frontend:

 const handleSubscribe = async (planId: string, billing: 'monthly' | 'annual') => {
  const plan = plans.find(p => p._id === planId);
  if (!plan) {
    setError('Plan not found');
    return;
  }

  if (!confirm(`Do you want to subscribe to "${plan.name}" (${billing})?`)) return;

  setActionLoading(planId);
  setError(null);

  try {
    const res = await fetch('/api/member/subscribe', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        planId, 
        billing // ✅ PASSAR O BILLING PARA A API
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    if (data.success) {
      alert(`🎉 ${data.message}\n\nRedirecting to content...`);
      await fetchData();
      
      setTimeout(() => {
        router.push('/member/content');
      }, 1500);
      
    } else {
      setError(data.message || 'Subscription failed');
    }

  } catch (err: any) {
    console.error('Subscribe error:', err);
    setError(err.message || 'Error subscribing to plan');
  } finally {
    setActionLoading(null);
  }
};

  const handleCancelSubscription = async () => {
    if (!mySubscription) return;
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    setActionLoading('cancel');
    try {
      const res = await fetch('/api/member/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error cancelling subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenewSubscription = async () => {
    if (!mySubscription) return;

    setActionLoading('renew');
    try {
      const res = await fetch('/api/member/renew-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error renewing subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      case 'expired': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'cancelled': return <Pause className="w-4 h-4" />;
      case 'expired': return <X className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'cancelled': return 'Cancelled';
      case 'expired': return 'Expired';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const getBillingLabel = (billing: string) => {
    switch (billing) {
      case 'monthly': return 'Monthly';
      case 'annual': return 'Annual';
      default: return billing;
    }
  };

  const PlanCard = ({ plan, isCurrentPlan }: { plan: Plan; isCurrentPlan: boolean }) => (
    <div className={`relative bg-slate-800/50 backdrop-blur-sm border ${
      isCurrentPlan 
        ? 'border-green-500/50 shadow-green-500/20' 
        : plan.popular 
        ? 'border-purple-500/50 shadow-purple-500/20' 
        : 'border-slate-700/50'
    } rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02]`}>
      
      {/* Badges */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        {isCurrentPlan && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Current Plan
          </div>
        )}
        {plan.popular && !isCurrentPlan && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Popular
          </div>
        )}
      </div>

      {/* Plan Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        isCurrentPlan
          ? 'bg-gradient-to-r from-green-500 to-green-600'
          : plan.popular 
          ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
          : 'bg-gradient-to-r from-slate-600 to-slate-700'
      }`}>
        <Crown className="w-6 h-6 text-white" />
      </div>

      {/* Plan Details */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-slate-400 text-sm">{plan.description}</p>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        {plan.monthlyPrice && (
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-white">
              ${plan.monthlyPrice.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm">/month</span>
          </div>
        )}
        {plan.annualPrice && (
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-semibold text-purple-400">
              ${plan.annualPrice.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm">/year</span>
            {plan.monthlyPrice && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                {Math.round((1 - (plan.annualPrice / (plan.monthlyPrice * 12))) * 100)}% off
              </span>
            )}
          </div>
        )}
        {plan.trialDays && !isCurrentPlan && (
          <div className="flex items-center gap-1 mt-2 text-blue-400 text-sm">
            <Gift className="w-4 h-4" />
            {plan.trialDays} days free
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Features included</h4>
        <div className="space-y-2">
          {(plan.features || plan.benefits || []).map((benefit, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {!isCurrentPlan && plan.active && (
          <>
            {plan.monthlyPrice && (
              <button
                onClick={() => handleSubscribe(plan._id, 'monthly')}
                disabled={actionLoading === plan._id}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                {actionLoading === plan._id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Subscribe - Monthly
              </button>
            )}
            {plan.annualPrice && (
              <button
                onClick={() => handleSubscribe(plan._id, 'annual')}
                disabled={actionLoading === plan._id}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === plan._id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                Subscribe - Annual
              </button>
            )}
          </>
        )}
        
        {isCurrentPlan && (
          <button
            onClick={() => router.push('/member/content')}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Content
          </button>
        )}
      </div>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
      <Layout activeTab="member-plans">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading plans...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout activeTab="member-plans">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">Access denied</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab="member-plans">
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            My Plans
          </h1>
          <p className="text-slate-400">Manage your subscription and explore available plans</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Current Subscription */}
        {mySubscription && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Subscription Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <div className={`flex items-center gap-2 text-lg font-medium ${getStatusColor(mySubscription.status)}`}>
                    {getStatusIcon(mySubscription.status)}
                    {getStatusLabel(mySubscription.status)}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400">Amount</label>
                  <div className="text-lg font-bold text-white">
                    ${mySubscription.amount.toFixed(2)} / {getBillingLabel(mySubscription.billing)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {mySubscription.nextBillingDate && (
                  <div>
                    <label className="text-sm text-slate-400">Next Billing</label>
                    <div className="text-lg text-white">
                      {new Date(mySubscription.nextBillingDate).toLocaleDateString('en-US')}
                    </div>
                  </div>
                )}

                {mySubscription.cancellationDate && (
                  <div>
                    <label className="text-sm text-slate-400">Cancelled On</label>
                    <div className="text-lg text-red-400">
                      {new Date(mySubscription.cancellationDate).toLocaleDateString('en-US')}
                    </div>
                  </div>
                )}

                {mySubscription.expirationDate && (
                  <div>
                    <label className="text-sm text-slate-400">Expires On</label>
                    <div className="text-lg text-red-400">
                      {new Date(mySubscription.expirationDate).toLocaleDateString('en-US')}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {mySubscription.status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'cancel' ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                    Cancel
                  </button>
                )}

                {(mySubscription.status === 'expired' || mySubscription.status === 'cancelled') && (
                  <button
                    onClick={handleRenewSubscription}
                    disabled={actionLoading === 'renew'}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'renew' ? (
                      <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Renew
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            {mySubscription?.status === 'active' ? 'Upgrade Plans' : 'Available Plans'}
          </h2>
          
          {plans.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <Crown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No plans available</h3>
              <p className="text-slate-500">Check back later for new subscription plans</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.filter(p => p.active).map((plan) => (
                <PlanCard 
                  key={plan._id} 
                  plan={plan} 
                  isCurrentPlan={mySubscription?.planId === plan._id && mySubscription?.status === 'active'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(MyPlansPage);