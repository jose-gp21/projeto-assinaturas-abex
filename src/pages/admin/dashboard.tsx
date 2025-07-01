// src/pages/admin/dashboard.tsx - Com gráficos implementados
'use client'
import Layout from '@/components/Layout';
import withAuth from '@/components/withAuth';
import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
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
  PieChart as PieChartIcon,
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
  totalPlans: number;
  totalContent: number;
  restrictedContent: number;
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

  // Gerar dados históricos baseados nos dados atuais
  const generateChartData = () => {
    if (!data) return { revenueData: [], userGrowthData: [], conversionData: [] };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentUsers = data.totalUsers;
    const currentRevenue = data.revenueData?.monthly || 0;
    const currentSubs = data.activeSubscriptions;

    // Simular crescimento histórico
    const revenueData = months.map((month, index) => {
      const factor = (index + 1) / 6; // Crescimento gradual
      return {
        month,
        revenue: Math.round(currentRevenue * factor * 100) / 100,
        subscriptions: Math.round(currentSubs * factor),
        users: Math.round(currentUsers * factor)
      };
    });

    const userGrowthData = months.map((month, index) => {
      const factor = (index + 1) / 6;
      return {
        month,
        users: Math.round(currentUsers * factor),
        newUsers: Math.round((currentUsers * factor) - (currentUsers * (factor - 0.1))),
        activeUsers: Math.round(currentUsers * factor * 0.8)
      };
    });

    // Dados para gráfico de conversão
    const conversionData = [
      { name: 'Visitantes', value: data.totalUsers + 50, color: '#6366f1' },
      { name: 'Usuários', value: data.totalUsers, color: '#8b5cf6' },
      { name: 'Premium', value: data.activeSubscriptions, color: '#10b981' },
    ];

    return { revenueData, userGrowthData, conversionData };
  };

  const { revenueData, userGrowthData, conversionData } = generateChartData();

  const fetchDashboardData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/reports?period=${timeFilter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Response is not JSON:', text);
        throw new Error('Server returned non-JSON response');
      }

      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      
      if (err.name === 'SyntaxError') {
        setError('Invalid server response format. Please check the API endpoint.');
      } else if (err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Error loading dashboard data.');
      }
      
      setData({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalPlans: 0,
        totalContent: 0,
        restrictedContent: 0,
        monthlyGrowth: {
          users: 0,
          subscriptions: 0,
          content: 0
        },
        revenueData: {
          total: 0,
          monthly: 0,
          growth: 0
        }
      });
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
      <Layout activeTab='dashboard'>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout activeTab='dashboard'>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-red-400 text-xl font-bold mb-2">Error loading data</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => fetchDashboardData()}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors w-full"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors w-full"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab='dashboard'>
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-8">
        
        {/* Error Alert */}
        {error && data && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Warning</p>
                <p className="text-slate-300 text-sm">{error}</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="ml-auto bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Platform overview and real-time metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={data?.totalUsers || 0}
            icon={Users}
            trend="up"
            trendValue={`+${data?.monthlyGrowth?.users || 0}%`}
            color="from-blue-500 to-blue-600"
            subtitle="Monthly growth"
          />
          
          <StatCard
            title="Active Subscriptions"
            value={data?.activeSubscriptions || 0}
            icon={Crown}
            trend="up"
            trendValue={`+${data?.monthlyGrowth?.subscriptions || 0}%`}
            color="from-purple-500 to-purple-600"
            subtitle="Premium members"
          />
          
          <StatCard
            title="Active Plans"
            value={data?.totalPlans || 0}
            icon={Target}
            trend="neutral"
            trendValue="stable"
            color="from-green-500 to-green-600"
            subtitle="Available offers"
          />
          
          <StatCard
            title="Total Content"
            value={data?.totalContent || 0}
            icon={FileText}
            trend="up"
            trendValue={`+${data?.monthlyGrowth?.content || 0}%`}
            color="from-orange-500 to-orange-600"
            subtitle="Published materials"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Revenue Analytics</h2>
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Monthly Revenue</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${(data?.revenueData?.monthly || 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-400">
                  +{data?.revenueData?.growth || 0}% vs last month
                </p>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Conversion Rate</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {((data?.activeSubscriptions || 0) / (data?.totalUsers || 1) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-slate-400">Users to premium</p>
              </div>
            </div>
            
            {/* Revenue Line Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Conversion Funnel */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-yellow-400" />
              Conversion Funnel
            </h2>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-4">
              {conversionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-slate-300 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">User Growth Analytics</h2>
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)"
                  name="Total Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stackId="2"
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorActive)"
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <QuickAction
                icon={Users}
                label="Manage Users"
                onClick={() => {}}
                color="from-blue-500 to-blue-600"
              />
              <QuickAction
                icon={Crown}
                label="Create Plan"
                onClick={() => {}}
                color="from-purple-500 to-purple-600"
              />
              <QuickAction
                icon={FileText}
                label="New Content"
                onClick={() => {}}
                color="from-green-500 to-green-600"
              />
              <QuickAction
                icon={Shield}
                label="Settings"
                onClick={() => {}}
                color="from-orange-500 to-orange-600"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{data?.restrictedContent || 0}</h3>
            <p className="text-slate-400 text-sm">Restricted Content</p>
            <p className="text-red-400 text-xs mt-2">Premium members only</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {Math.round(((data?.activeSubscriptions || 0) / (data?.totalUsers || 1)) * 100)}%
            </h3>
            <p className="text-slate-400 text-sm">Engagement Rate</p>
            <p className="text-indigo-400 text-xs mt-2">Active users today</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AdminDashboardPage, { requiresAdmin: true });