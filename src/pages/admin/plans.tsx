'use client'
// src/pages/admin/plans.tsx
import Layout from '@/components/Layout';
import withAuth from '@/components/withAuth';
import { useState, useEffect } from 'react';
import { 
  Crown, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  X,
  Save,
  AlertCircle,
  Zap,
  Users,
  Star,
  Clock,
  Gift,
  Sparkles,
  Target,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';

interface Plan {
  _id: string;
  name: string;
  monthlyValue?: number;
  annualValue?: number;
  description: string;
  benefits: string[];
  trialDays?: number;
  popular?: boolean;
  active?: boolean;
}

function ManagePlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<Partial<Plan>>({
    name: '',
    description: '',
    benefits: [],
    monthlyValue: undefined,
    annualValue: undefined,
    trialDays: undefined,
    popular: false,
    active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading plans');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      const newValue = type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value;
      setForm({ ...form, [name]: newValue });
    }
  };

  const handleBenefitsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, benefits: e.target.value.split(',').map(b => b.trim()).filter(b => b) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    const method = isEditing ? 'PUT' : 'POST';
    const url = '/api/admin/plans';
    const body = isEditing ? { ...form, id: currentPlanId } : form;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchPlans();
        setShowForm(false);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error saving plan');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      benefits: [],
      monthlyValue: undefined,
      annualValue: undefined,
      trialDays: undefined,
      popular: false,
      active: true,
    });
    setIsEditing(false);
    setCurrentPlanId(null);
    setError(null);
  };

  const handleEdit = (plan: Plan) => {
    setForm({
      name: plan.name,
      monthlyValue: plan.monthlyValue,
      annualValue: plan.annualValue,
      description: plan.description,
      benefits: plan.benefits,
      trialDays: plan.trialDays,
      popular: plan.popular || false,
      active: plan.active !== false,
    });
    setIsEditing(true);
    setCurrentPlanId(plan._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPlans();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting plan');
    }
  };

  const togglePlanStatus = async (id: string, active: boolean) => {
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, active: !active }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPlans();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error updating plan status');
    }
  };

  const PlanCard = ({ plan }: { plan: Plan }) => (
    <div className={`relative bg-slate-800/50 backdrop-blur-sm border ${
      plan.popular ? 'border-purple-500/50 shadow-purple-500/20' : 'border-slate-700/50'
    } rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] group`}>
      
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Popular
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => togglePlanStatus(plan._id, plan.active !== false)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            plan.active !== false 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
        >
          {plan.active !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {plan.active !== false ? 'Active' : 'Inactive'}
        </button>
      </div>

      {/* Plan Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        plan.popular 
          ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
          : 'bg-gradient-to-r from-slate-600 to-slate-700'
      }`}>
        <Crown className="w-6 h-6 text-white" />
      </div>

      {/* Plan Details */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-slate-400 text-sm line-clamp-2">{plan.description}</p>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        {plan.monthlyValue && (
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-white">
              ${plan.monthlyValue.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm">/month</span>
          </div>
        )}
        {plan.annualValue && (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-purple-400">
              ${plan.annualValue.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm">/year</span>
            {plan.monthlyValue && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                {Math.round((1 - (plan.annualValue / (plan.monthlyValue * 12))) * 100)}% off
              </span>
            )}
          </div>
        )}
        {plan.trialDays && (
          <div className="flex items-center gap-1 mt-2 text-blue-400 text-sm">
            <Gift className="w-4 h-4" />
            {plan.trialDays} days free
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Benefits included</h4>
        <div className="space-y-2">
          {plan.benefits.slice(0, 3).map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="line-clamp-1">{benefit}</span>
            </div>
          ))}
          {plan.benefits.length > 3 && (
            <div className="text-xs text-slate-500">
              +{plan.benefits.length - 3} additional benefits
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-700">
        <button
          onClick={() => handleEdit(plan)}
          className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => handleDelete(plan._id, plan.name)}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout activeTab='admin-plans'>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading plans...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab="admin-plans">
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Manage Plans
            </h1>
            <p className="text-slate-400">Create and manage subscription plans for your platform</p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Plan
          </button>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{plans.length}</p>
                <p className="text-slate-400 text-sm">Total Plans</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {plans.filter(p => p.active !== false).length}
                </p>
                <p className="text-slate-400 text-sm">Active Plans</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {plans.filter(p => p.popular).length}
                </p>
                <p className="text-slate-400 text-sm">Popular Plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-400" />
            Registered Plans ({plans.length})
          </h2>
          
          {plans.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <Crown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No plans registered</h3>
              <p className="text-slate-500 mb-6">Start by creating your first subscription plan</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create First Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard key={plan._id} plan={plan} />
              ))}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {isEditing ? <Edit3 className="w-6 h-6 text-blue-400" /> : <Plus className="w-6 h-6 text-purple-400" />}
                  {isEditing ? 'Edit Plan' : 'Create New Plan'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Premium Plan"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Monthly Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        name="monthlyValue"
                        value={form.monthlyValue ?? ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Annual Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        name="annualValue"
                        value={form.annualValue ?? ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Free Trial Days
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        name="trialDays"
                        value={form.trialDays ?? ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe what this plan offers..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Benefits
                  </label>
                  <textarea
                    name="benefits"
                    value={form.benefits?.join(', ') || ''}
                    onChange={handleBenefitsChange}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Access to premium content, Priority support, Exclusive webinars"
                  />
                  <p className="text-slate-500 text-xs mt-1">Separate benefits with commas</p>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={form.popular || false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-slate-300 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Mark as popular
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active !== false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-slate-600 text-green-500 focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-slate-300 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Active plan
                    </span>
                  </label>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {formLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(ManagePlansPage, { requiresAdmin: true });