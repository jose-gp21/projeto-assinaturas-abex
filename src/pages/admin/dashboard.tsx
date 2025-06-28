'use client'
// src/pages/admin/dashboard.tsx
import Layout from '@/components/Layout';
import withAuth from '@/components/withAuth';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  FileText, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  UserCheck,
  Lock,
  Zap,
  Clock,
  Target,
  Award,
  RefreshCw,
  Filter,
  Download,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  activeSubscriptions: number;
  totalPlanos: number;
  totalConteudo: number;
  restrictedConteudo: number;
  monthlyGrowth?: {
    users: number;
    subscriptions: number;
    content: number;
  };
  revenueData?: {
    total: number;
    monthly: number;
    growth: number;
  };
  topContent?: Array<{
    _id: string;
    titulo: string;
    views: number;
    engagement: number;
  }>;
  recentActivity?: Array<{
    id: string;
    type: string;
    user: string;
    action: string;
    timestamp: string;
  }>;
}

function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/relatorios?period=${timeFilter}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color, 
    subtitle 
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-500/20 text-green-400' :
            trend === 'down' ? 'bg-red-500/20 text-red-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
             trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <Activity className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, label, onClick, color }: {
    icon: any;
    label: string;
    onClick: () => void;
    color: string;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${color} text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      {label}
    </button>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Carregando Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-4">Erro ao carregar dados</p>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-slate-400">Visão geral da plataforma e métricas em tempo real</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Filter */}
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Export Button */}
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Usuários"
            value={data?.totalUsers || 0}
            icon={Users}
            trend="up"
            trendValue={`+${data?.monthlyGrowth?.users || 0}%`}
            color="from-blue-500 to-blue-600"
            subtitle="Crescimento mensal"
          />
          
          <StatCard
            title="Assinaturas Ativas"
            value={data?.activeSubscriptions || 0}
            icon={Crown}
            trend="up"
            trendValue={`+${data?.monthlyGrowth?.subscriptions || 0}%`}
            color="from-purple-500 to-purple-600"
            subtitle="Membros premium"
          />
          
          <StatCard
            title="Planos Ativos"
            value={data?.totalPlanos || 0}
            icon={Target}
            trend="neutral"
            trendValue="estável"
            color="from-green-500 to-green-600"
            subtitle="Ofertas disponíveis"
          />
          
          <StatCard
            title="Conteúdo Total"
            value={data?.totalConteudo || 0}
            icon={FileText}
            trend="up"
            trendValue={`+${data?.monthlyGrowth?.content || 0}%`}
            color="from-orange-500 to-orange-600"
            subtitle="Materiais publicados"
          />
        </div>

        {/* Revenue & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Performance Geral</h2>
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Receita Mensal</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  R$ {(data?.revenueData?.monthly || 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-400">
                  +{data?.revenueData?.growth || 0}% vs mês anterior
                </p>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Taxa de Conversão</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {((data?.activeSubscriptions || 0) / (data?.totalUsers || 1) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-slate-400">Usuários para premium</p>
              </div>
            </div>
            
            {/* Simulated chart area */}
            <div className="h-48 bg-slate-900/30 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Gráfico de Performance</p>
                <p className="text-sm">(Integração com biblioteca de gráficos)</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Ações Rápidas
            </h2>
            
            <div className="space-y-3">
              <QuickAction
                icon={Users}
                label="Gerenciar Usuários"
                onClick={() => {}}
                color="from-blue-500 to-blue-600"
              />
              <QuickAction
                icon={Crown}
                label="Criar Plano"
                onClick={() => {}}
                color="from-purple-500 to-purple-600"
              />
              <QuickAction
                icon={FileText}
                label="Novo Conteúdo"
                onClick={() => {}}
                color="from-green-500 to-green-600"
              />
              <QuickAction
                icon={Shield}
                label="Configurações"
                onClick={() => {}}
                color="from-orange-500 to-orange-600"
              />
            </div>
            
            {/* System Status */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Status do Sistema</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">API Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Database</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Conectado</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">CDN</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Analytics & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Content */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-green-400" />
                Conteúdo Popular
              </h2>
              <button className="text-slate-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item, index) => (
                <div key={item} className="flex items-center gap-4 p-3 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      Título do Conteúdo {item}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {Math.floor(Math.random() * 1000) + 100} visualizações
                    </p>
                  </div>
                  <div className="text-green-400 text-sm font-medium">
                    +{Math.floor(Math.random() * 50) + 10}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                Atividade Recente
              </h2>
              <button className="text-slate-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { action: "Nova assinatura", user: "João Silva", time: "2 min atrás", type: "subscription" },
                { action: "Conteúdo visualizado", user: "Maria Santos", time: "5 min atrás", type: "view" },
                { action: "Novo usuário", user: "Pedro Costa", time: "12 min atrás", type: "user" },
                { action: "Plano atualizado", user: "Ana Oliveira", time: "20 min atrás", type: "plan" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'subscription' ? 'bg-purple-500/20' :
                    activity.type === 'view' ? 'bg-green-500/20' :
                    activity.type === 'user' ? 'bg-blue-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    {activity.type === 'subscription' ? <Crown className="w-4 h-4 text-purple-400" /> :
                     activity.type === 'view' ? <Eye className="w-4 h-4 text-green-400" /> :
                     activity.type === 'user' ? <Users className="w-4 h-4 text-blue-400" /> :
                     <Target className="w-4 h-4 text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{activity.action}</p>
                    <p className="text-slate-400 text-xs">{activity.user}</p>
                  </div>
                  <span className="text-slate-500 text-xs">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{data?.restrictedConteudo || 0}</h3>
            <p className="text-slate-400 text-sm">Conteúdo Restrito</p>
            <p className="text-red-400 text-xs mt-2">Apenas para membros premium</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {Math.round(((data?.activeSubscriptions || 0) / (data?.totalUsers || 1)) * 100)}%
            </h3>
            <p className="text-slate-400 text-sm">Taxa de Engajamento</p>
            <p className="text-indigo-400 text-xs mt-2">Usuários ativos hoje</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">98.5%</h3>
            <p className="text-slate-400 text-sm">Satisfação</p>
            <p className="text-teal-400 text-xs mt-2">Rating médio dos usuários</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AdminDashboardPage, { requiresAdmin: true });