import React, { useState, useEffect } from 'react';
import { IPlan } from '@/lib/models/Plan';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currencyUtils';
import PlanCard from './PlanCard';
import PayButton from './PayButton';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: IPlan[];
  currentPlanId?: string;
  onPaymentSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plans,
  currentPlanId,
  onPaymentSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(null);
      setBilling('monthly');
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Filter plans based on billing type
  const availablePlans = plans.filter(plan => {
    return billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  });

  const handlePlanSelect = (planId: string, selectedBilling: 'monthly' | 'annual') => {
    const plan = plans.find(p => p._id.toString() === planId);
    if (plan) {
      setSelectedPlan(plan);
      setBilling(selectedBilling);
      setError(null);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  const handlePaymentStart = () => {
    setLoading(true);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Escolha seu Plano</h2>
            <p className="text-gray-600 mt-1">Selecione o plano ideal para você</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setBilling('monthly')}
                disabled={loading}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  billing === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBilling('annual')}
                disabled={loading}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  billing === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Anual
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Economize até 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          {availablePlans.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano disponível</h3>
              <p className="text-gray-600">
                Não há planos {billing === 'annual' ? 'anuais' : 'mensais'} disponíveis no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlans.map((plan, index) => (
                <PlanCard
                  key={plan._id.toString()}
                  plan={plan}
                  billing={billing}
                  onSelect={handlePlanSelect}
                  isPopular={index === 1} // Make second plan popular
                  loading={loading}
                  currentPlanId={currentPlanId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Erro no pagamento</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedPlan.name}</h3>
                <p className="text-sm text-gray-600">
                  Cobrança {billing === 'annual' ? 'anual' : 'mensal'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(billing === 'annual' ? selectedPlan.annualPrice! : selectedPlan.monthlyPrice!, language)}
                  </p>
                  <p className="text-sm text-gray-500">
                    /{billing === 'annual' ? 'ano' : 'mês'}
                  </p>
                </div>
                <PayButton
                  planId={selectedPlan._id.toString()}
                  billing={billing}
                  planName={selectedPlan.name}
                  price={billing === 'annual' ? selectedPlan.annualPrice! : selectedPlan.monthlyPrice!}
                  onPaymentStart={handlePaymentStart}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={handlePaymentError}
                  disabled={loading}
                  className="min-w-[200px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;