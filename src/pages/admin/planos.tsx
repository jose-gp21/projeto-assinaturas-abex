'use client'
// src/pages/admin/planos.tsx
import Layout from '@/components/Layout';
import withAuth from '@/components/withAuth';
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

interface Plano {
  _id: string;
  nome: string;
  valorMensal?: number;
  valorAnual?: number;
  descricao: string;
  beneficios: string[];
  diasTeste?: number;
  popular?: boolean;
  ativo?: boolean;
}

function GerenciarPlanosPage() {
  const { t } = useTranslation(['admin', 'common']);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<Partial<Plano>>({
    nome: '',
    descricao: '',
    beneficios: [],
    valorMensal: undefined,
    valorAnual: undefined,
    diasTeste: undefined,
    popular: false,
    ativo: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanoId, setCurrentPlanoId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const res = await fetch('/api/admin/planos');
      const data = await res.json();
      if (data.success) {
        setPlanos(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || t('common:error'));
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

  const handleBeneficiosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, beneficios: e.target.value.split(',').map(b => b.trim()).filter(b => b) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    const method = isEditing ? 'PUT' : 'POST';
    const url = '/api/admin/planos';
    const body = isEditing ? { ...form, id: currentPlanoId } : form;

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
        fetchPlanos();
        setShowForm(false);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || t('common:error'));
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      nome: '',
      descricao: '',
      beneficios: [],
      valorMensal: undefined,
      valorAnual: undefined,
      diasTeste: undefined,
      popular: false,
      ativo: true,
    });
    setIsEditing(false);
    setCurrentPlanoId(null);
    setError(null);
  };

  const handleEdit = (plano: Plano) => {
    setForm({
      nome: plano.nome,
      valorMensal: plano.valorMensal,
      valorAnual: plano.valorAnual,
      descricao: plano.descricao,
      beneficios: plano.beneficios,
      diasTeste: plano.diasTeste,
      popular: plano.popular || false,
      ativo: plano.ativo !== false,
    });
    setIsEditing(true);
    setCurrentPlanoId(plano._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`${t('plans.deleteConfirm')} "${nome}"?`)) return;

    try {
      const res = await fetch(`/api/admin/planos?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPlanos();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || t('common:error'));
    }
  };

  const togglePlanoStatus = async (id: string, ativo: boolean) => {
    try {
      const res = await fetch('/api/admin/planos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ativo: !ativo }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPlanos();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || t('common:error'));
    }
  };

  const PlanCard = ({ plano }: { plano: Plano }) => (
    <div className={`relative bg-slate-800/50 backdrop-blur-sm border ${
      plano.popular ? 'border-purple-500/50 shadow-purple-500/20' : 'border-slate-700/50'
    } rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] group`}>
      
      {/* Popular Badge */}
      {plano.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {t('plans.popular')}
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => togglePlanoStatus(plano._id, plano.ativo !== false)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            plano.ativo !== false 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
        >
          {plano.ativo !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {plano.ativo !== false ? t('plans.actions.active') : t('plans.actions.inactive')}
        </button>
      </div>

      {/* Plan Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        plano.popular 
          ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
          : 'bg-gradient-to-r from-slate-600 to-slate-700'
      }`}>
        <Crown className="w-6 h-6 text-white" />
      </div>

      {/* Plan Details */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plano.nome}</h3>
        <p className="text-slate-400 text-sm line-clamp-2">{plano.descricao}</p>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        {plano.valorMensal && (
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-white">
              R$ {plano.valorMensal.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm">/mês</span>
          </div>
        )}
        {plano.valorAnual && (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-purple-400">
              R$ {plano.valorAnual.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm">/ano</span>
            {plano.valorMensal && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                {Math.round((1 - (plano.valorAnual / (plano.valorMensal * 12))) * 100)}% {t('plans.discount')}
              </span>
            )}
          </div>
        )}
        {plano.diasTeste && (
          <div className="flex items-center gap-1 mt-2 text-blue-400 text-sm">
            <Gift className="w-4 h-4" />
            {plano.diasTeste} dias grátis
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">{t('plans.benefitsIncluded')}</h4>
        <div className="space-y-2">
          {plano.beneficios.slice(0, 3).map((beneficio, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="line-clamp-1">{beneficio}</span>
            </div>
          ))}
          {plano.beneficios.length > 3 && (
            <div className="text-xs text-slate-500">
              +{plano.beneficios.length - 3} {t('plans.additionalBenefits')}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-700">
        <button
          onClick={() => handleEdit(plano)}
          className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          {t('plans.actions.edit')}
        </button>
        <button
          onClick={() => handleDelete(plano._id, plano.nome)}
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
            <p className="text-slate-300 text-lg">{t('plans.loading')}</p>
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
              {t('plans.title')}
            </h1>
            <p className="text-slate-400">{t('plans.subtitle')}</p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            {t('plans.newPlan')}
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
                <p className="text-2xl font-bold text-white">{planos.length}</p>
                <p className="text-slate-400 text-sm">{t('plans.totalPlans')}</p>
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
                  {planos.filter(p => p.ativo !== false).length}
                </p>
                <p className="text-slate-400 text-sm">{t('plans.activePlans')}</p>
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
                  {planos.filter(p => p.popular).length}
                </p>
                <p className="text-slate-400 text-sm">{t('plans.popularPlans')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-400" />
            {t('plans.plansCadastrados')}
          </h2>
          
          {planos.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <Crown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">{t('plans.noPlansCadastrados')}</h3>
              <p className="text-slate-500 mb-6">{t('plans.startCreating')}</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                {t('plans.createFirstPlan')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planos.map((plano) => (
                <PlanCard key={plano._id} plano={plano} />
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
                  {isEditing ? t('plans.editPlan') : t('plans.createPlan')}
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
                      {t('plans.form.planName')} *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={form.nome || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('plans.form.planNamePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      {t('plans.form.monthlyValue')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        name="valorMensal"
                        value={form.valorMensal ?? ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      {t('plans.form.annualValue')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        name="valorAnual"
                        value={form.valorAnual ?? ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      {t('plans.form.freeTrialDays')}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        name="diasTeste"
                        value={form.diasTeste ?? ''}
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
                    {t('plans.form.description')} *
                  </label>
                  <textarea
                    name="descricao"
                    value={form.descricao || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('plans.form.descriptionPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    {t('plans.form.benefits')}
                  </label>
                  <textarea
                    name="beneficios"
                    value={form.beneficios?.join(', ') || ''}
                    onChange={handleBeneficiosChange}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('plans.form.benefitsPlaceholder')}
                  />
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
                      {t('plans.form.markAsPopular')}
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={form.ativo !== false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-slate-600 text-green-500 focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-slate-300 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {t('plans.form.activePlan')}
                    </span>
                  </label>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    {t('plans.form.cancel')}
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
                    {formLoading ? t('plans.form.saving') : isEditing ? t('plans.form.save') : t('plans.form.create')}
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

export default withAuth(GerenciarPlanosPage, { requiresAdmin: true });

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pt-BR', ['admin', 'common'])),
    },
  };
};