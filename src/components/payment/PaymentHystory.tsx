import React, { useState, useEffect } from 'react';

interface PaymentRecord {
  _id: string;
  amount: number;
  billing: 'monthly' | 'annual';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  planId: {
    _id: string;
    name: string;
    description: string;
  };
  subscriptionId: {
    _id: string;
    type: 'Monthly' | 'Annual';
    status: string;
  };
}

interface PaymentHistoryProps {
  userId?: string;
  limit?: number;
  showTitle?: boolean;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ 
  limit, 
  showTitle = true 
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/member/payment-history');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar histórico de pagamentos');
      }

      const data = await response.json();
      let paymentsData = Array.isArray(data) ? data : data.data || [];
      
      // Apply limit if specified
      if (limit) {
        paymentsData = paymentsData.slice(0, limit);
      }
      
      setPayments(paymentsData);
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      setError(error.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeitado' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' },
      refunded: { color: 'bg-blue-100 text-blue-800', label: 'Reembolsado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return null;

    if (method.includes('credit_card') || method.includes('debit_card')) {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    }

    if (method.includes('pix')) {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 12l10 10 10-10L12 2z"/>
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        {showTitle && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Pagamentos</h3>
          </div>
        )}
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        {showTitle && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Pagamentos</h3>
          </div>
        )}
        <div className="p-6">
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar histórico</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchPaymentHistory}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        {showTitle && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Pagamentos</h3>
          </div>
        )}
        <div className="p-6">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
            <p className="text-gray-600">Você ainda não realizou nenhum pagamento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {showTitle && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Histórico de Pagamentos</h3>
            <button
              onClick={fetchPaymentHistory}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              title="Atualizar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {payments.map((payment) => (
          <div key={payment._id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Payment Icon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${payment.status === 'approved' ? 'bg-green-100' : 
                    payment.status === 'pending' ? 'bg-yellow-100' : 
                    payment.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'}
                `}>
                  {payment.status === 'approved' ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : payment.status === 'pending' ? (
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                {/* Payment Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {payment.planId.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      ({payment.billing === 'annual' ? 'Anual' : 'Mensal'})
                    </span>
                  </div>
                  
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatDate(payment.createdAt)}</span>
                    
                    {payment.paymentMethod && (
                      <div className="flex items-center space-x-1">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    
                    {payment.paidAt && payment.paidAt !== payment.createdAt && (
                      <span className="text-green-600">
                        Pago em {formatDate(payment.paidAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount and Status */}
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(payment.amount)}
                </div>
                <div className="mt-1">
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            {payment.subscriptionId && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Assinatura: {payment.subscriptionId._id}</span>
                  <span className={`font-medium ${
                    payment.subscriptionId.status === 'Active' ? 'text-green-600' :
                    payment.subscriptionId.status === 'Cancelled' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {payment.subscriptionId.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button (if limit is applied) */}
      {limit && payments.length >= limit && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => window.location.href = '/member/payments'}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Ver histórico completo
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;