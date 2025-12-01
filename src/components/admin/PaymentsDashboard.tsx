// src/components/admin/PaymentsDashboard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Users,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-react';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  method: string;
  status: 'approved' | 'pending' | 'failed' | 'cancelled';
  date: string;
  transactionId: string;
}

const PaymentsDashboard = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchTerm, setSearchTerm] = useState('');

  // 🔥 BUSCAR DADOS DA API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/payments');
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        // Fallback para dados mock em caso de erro
        setPayments([
          {
            id: 'PAY-001',
            userId: 'user-123',
            userName: 'João Silva',
            userEmail: 'joao@email.com',
            planName: 'Premium',
            amount: 79.00,
            method: 'Cartão de Crédito',
            status: 'approved',
            date: new Date().toISOString(),
            transactionId: 'TXN-ABC123'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Status config
  const statusConfig = {
    approved: { 
      label: 'Aprovado', 
      color: 'text-green-400 bg-green-500/20',
      icon: CheckCircle 
    },
    pending: { 
      label: 'Pendente', 
      color: 'text-yellow-400 bg-yellow-500/20',
      icon: Clock 
    },
    failed: { 
      label: 'Recusado', 
      color: 'text-red-400 bg-red-500/20',
      icon: XCircle 
    },
    cancelled: { 
      label: 'Cancelado', 
      color: 'text-gray-400 bg-gray-500/20',
      icon: AlertCircle 
    }
  };

  // Filtrar e ordenar pagamentos
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (searchTerm) {
      result = result.filter(p => 
        p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    if (filterMethod !== 'all') {
      result = result.filter(p => p.method === filterMethod);
    }

    result.sort((a, b) => {
      switch(sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [payments, filterStatus, filterMethod, sortBy, searchTerm]);

  // Cálculos de estatísticas
  const stats = useMemo(() => {
    const total = payments.reduce((acc, p) => acc + p.amount, 0);
    const approved = payments.filter(p => p.status === 'approved');
    const approvedTotal = approved.reduce((acc, p) => acc + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').length;
    
    return {
      total: total.toFixed(2),
      approvedTotal: approvedTotal.toFixed(2),
      transactionsCount: payments.length,
      approvedCount: approved.length,
      pendingCount: pending,
      avgTicket: (total / payments.length || 0).toFixed(2)
    };
  }, [payments]);

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gráfico - dados dos últimos 7 dias
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayPayments = payments.filter(p => 
        p.date.startsWith(dateStr) && p.status === 'approved'
      );
      const total = dayPayments.reduce((acc, p) => acc + p.amount, 0);

      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: total
      };
    });
  }, [payments]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dashboard de Pagamentos
            </h1>
            <p className="text-slate-400">
              Gerencie e acompanhe todas as transações da plataforma
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-400 text-sm font-medium">+12.5%</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Receita Total</p>
            <p className="text-2xl font-bold text-white">R$ {stats.approvedTotal}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-blue-400 text-sm font-medium">{stats.approvedCount}</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Transações Aprovadas</p>
            <p className="text-2xl font-bold text-white">{stats.transactionsCount}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-purple-400 text-sm font-medium">R$ {stats.avgTicket}</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-white">R$ {stats.avgTicket}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-yellow-400 text-sm font-medium">{stats.pendingCount}</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-white">{stats.pendingCount}</p>
          </div>
        </div>

        {/* Gráfico de Receita */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Receita dos Últimos 7 Dias
              </h2>
              <p className="text-slate-400 text-sm">
                Acompanhe a evolução diária das suas receitas
              </p>
            </div>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="flex items-end justify-between gap-4 h-48">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full bg-slate-700/50 rounded-t-lg overflow-hidden group">
                  <div 
                    className="bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg transition-all duration-500 hover:from-purple-500 hover:to-blue-400"
                    style={{ 
                      height: `${(item.value / maxValue) * 180}px`,
                      minHeight: '20px'
                    }}
                  >
                    <div className="absolute inset-0 flex items-start justify-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold bg-slate-900/80 px-2 py-1 rounded">
                        R$ {item.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-slate-400 text-xs font-medium">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos os Status</option>
              <option value="approved">Aprovado</option>
              <option value="pending">Pendente</option>
              <option value="failed">Recusado</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos os Métodos</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="PIX">PIX</option>
              <option value="Boleto">Boleto</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date-desc">Data (Mais Recente)</option>
              <option value="date-asc">Data (Mais Antigo)</option>
              <option value="amount-desc">Valor (Maior)</option>
              <option value="amount-asc">Valor (Menor)</option>
            </select>
          </div>
        </div>

        {/* Tabela de Pagamentos */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    ID / Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-12 h-12 text-slate-600" />
                        <p className="text-slate-400 font-medium">
                          Nenhuma transação encontrada
                        </p>
                        <p className="text-slate-500 text-sm">
                          Tente ajustar os filtros de busca
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const StatusIcon = statusConfig[payment.status].icon;
                    return (
                      <tr 
                        key={payment.id} 
                        className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {payment.id}
                            </p>
                            <p className="text-sm text-slate-400">
                              {payment.userName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {payment.userEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-white font-medium">
                            {payment.planName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-400">
                            R$ {payment.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-300">
                            {payment.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[payment.status].color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[payment.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
                            }}
                            className="text-purple-400 hover:text-purple-300 font-medium"
                          >
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalhes */}
        {selectedPayment && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPayment(null)}
          >
            <div 
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Detalhes da Transação
                </h3>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">ID da Transação</p>
                    <p className="text-white font-mono">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">ID Externo</p>
                    <p className="text-white font-mono">{selectedPayment.transactionId}</p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h4 className="text-white font-semibold mb-4">Informações do Cliente</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Nome</p>
                      <p className="text-white">{selectedPayment.userName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Email</p>
                      <p className="text-white">{selectedPayment.userEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h4 className="text-white font-semibold mb-4">Detalhes do Pagamento</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Plano</p>
                      <p className="text-white font-medium">{selectedPayment.planName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Valor</p>
                      <p className="text-green-400 font-bold text-lg">
                        R$ {selectedPayment.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Método de Pagamento</p>
                      <p className="text-white">{selectedPayment.method}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedPayment.status].color}`}>
                        {React.createElement(statusConfig[selectedPayment.status].icon, { className: 'w-4 h-4' })}
                        {statusConfig[selectedPayment.status].label}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Data</p>
                      <p className="text-white">{formatDate(selectedPayment.date)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                    Reembolsar
                  </button>
                  <button className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    Baixar Comprovante
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsDashboard;