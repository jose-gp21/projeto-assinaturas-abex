// src/pages/admin/plans.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import Layout from '@/components/Layout';
import { Crown, Edit, Trash2, Plus, DollarSign, Users, X, Check } from 'lucide-react';
import { useState } from 'react';
import { connectMongoose } from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';

interface PlanType {
  _id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isActive: boolean;
  trialDays: number;
}

interface AdminPlansPageProps {
  plans: PlanType[];
}

export default function AdminPlansPage({ plans = [] }: AdminPlansPageProps) {
  const [plansList, setPlansList] = useState<PlanType[]>(plans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: '',
    annualPrice: '',
    trialDays: '0',
    isActive: true,
  });
  
  const [features, setFeatures] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      monthlyPrice: '',
      annualPrice: '',
      trialDays: '0',
      isActive: true,
    });
    setFeatures(['']);
    setError('');
    setSuccess('');
    setIsEditMode(false);
    setEditingPlanId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: PlanType) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice.toString(),
      annualPrice: plan.annualPrice.toString(),
      trialDays: plan.trialDays.toString(),
      isActive: plan.isActive,
    });
    setFeatures(plan.features.length > 0 ? plan.features : ['']);
    setIsEditMode(true);
    setEditingPlanId(plan._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validações
      if (!formData.name || !formData.description) {
        setError('Nome e descrição são obrigatórios');
        setLoading(false);
        return;
      }

      const filteredFeatures = features.filter(f => f.trim() !== '');
      if (filteredFeatures.length === 0) {
        setError('Adicione pelo menos uma feature');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        monthlyPrice: parseFloat(formData.monthlyPrice),
        annualPrice: parseFloat(formData.annualPrice),
        trialDays: parseInt(formData.trialDays),
        features: filteredFeatures,
        isActive: formData.isActive,
      };

      if (isEditMode && editingPlanId) {
        // Atualizar plano existente
        const response = await fetch('/api/admin/plans', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingPlanId,
            ...payload,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erro ao atualizar plano');
          setLoading(false);
          return;
        }

        setSuccess('Plano atualizado com sucesso!');
        
        // Atualizar lista de planos
        setPlansList(plansList.map(p => p._id === editingPlanId ? data.plan : p));
      } else {
        // Criar novo plano
        const response = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erro ao criar plano');
          setLoading(false);
          return;
        }

        setSuccess('Plano criado com sucesso!');
        
        // Adicionar à lista de planos
        setPlansList([...plansList, data.plan]);
      }

      // Fechar modal após sucesso
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Error saving plan:', error);
      setError('Erro ao salvar plano');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return;

    try {
      const response = await fetch(`/api/admin/plans?id=${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Erro ao deletar plano');
        return;
      }

      setPlansList(plansList.filter(p => p._id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Erro ao deletar plano');
    }
  };

  return (
    <Layout activeTab="admin-plans">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gerenciar Planos
              </h1>
              <p className="text-slate-400">
                Crie e edite os planos de assinatura da plataforma
              </p>
            </div>
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Novo Plano
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Total de Planos</p>
              <p className="text-2xl font-bold text-white">{plansList.length}</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Planos Ativos</p>
              <p className="text-2xl font-bold text-white">
                {plansList.filter(p => p.isActive).length}
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Assinantes</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>

          {plansList.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
              <Crown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Nenhum plano cadastrado
              </h3>
              <p className="text-slate-400 mb-6">
                Comece criando seu primeiro plano de assinatura
              </p>
              <button 
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Plano
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plansList.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(plan)}
                        className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar plano"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(plan._id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Deletar plano"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">Mensal</span>
                      <span className="text-white font-bold">
                        R$ {plan.monthlyPrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">Anual</span>
                      <span className="text-white font-bold">
                        R$ {plan.annualPrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-xs mb-2">Features:</p>
                    <div className="space-y-1">
                      {(plan.features || []).slice(0, 3).map((feature, index) => (
                        <p key={index} className="text-slate-300 text-sm">
                          • {feature}
                        </p>
                      ))}
                      {(plan.features || []).length > 3 && (
                        <p className="text-slate-500 text-sm">
                          +{plan.features.length - 3} mais
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        plan.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {plan.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    {plan.trialDays > 0 && (
                      <span className="text-xs text-slate-400">
                        {plan.trialDays} dias grátis
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar Plano */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {isEditMode ? 'Editar Plano' : 'Criar Novo Plano'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 flex items-center gap-2">
                <Check className="w-5 h-5" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Premium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dias de Trial
                  </label>
                  <input
                    type="number"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({...formData, trialDays: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Descreva o plano..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Preço Mensal (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({...formData, monthlyPrice: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="29.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Preço Anual (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.annualPrice}
                    onChange={(e) => setFormData({...formData, annualPrice: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="299.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Features *
                </label>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ex: Acesso a todo conteúdo"
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    + Adicionar Feature
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">
                  Plano ativo
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Plano')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }

    // @ts-ignore
    if (session.user?.role !== 'admin') {
      return {
        redirect: {
          destination: '/member/content',
          permanent: false,
        },
      };
    }

    await connectMongoose();
    
    const plansFromDb = await Plan.find({}).lean().exec();
    const serializedPlans = JSON.parse(JSON.stringify(plansFromDb));

    return {
      props: {
        plans: serializedPlans || [],
      },
    };
  } catch (error) {
    console.error('Error loading plans:', error);
    
    return {
      props: {
        plans: [],
      },
    };
  }
};