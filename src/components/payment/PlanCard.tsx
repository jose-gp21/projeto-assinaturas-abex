import React from 'react';
import { IPlan } from '@/lib/models/Plan';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/currencyUtils';

interface PlanCardProps {
  plan: IPlan;
  billing: 'monthly' | 'annual';
  onSelect: (planId: string, billing: 'monthly' | 'annual') => void;
  isPopular?: boolean;
  loading?: boolean;
  currentPlanId?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  billing, 
  onSelect, 
  isPopular = false, 
  loading = false,
  currentPlanId 
}) => {
  const { language } = useLanguage();
  const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const isCurrentPlan = currentPlanId === plan._id.toString();

  if (!price) {
    return null; // Don't render if no price for selected billing
  }

  const getMonthlyEquivalent = () => {
    if (billing === 'annual' && plan.annualPrice) {
      return plan.annualPrice / 12;
    }
    return price;
  };

  const getSavings = () => {
    if (billing === 'annual' && plan.monthlyPrice && plan.annualPrice) {
      const yearlyMonthly = plan.monthlyPrice * 12;
      const savings = yearlyMonthly - plan.annualPrice;
      return savings;
    }
    return 0;
  };

  return (
    <div className={`
      relative bg-white rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg
      ${isPopular ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'}
      ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''}
    `}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Mais Popular
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Plano Atual
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 text-sm">{plan.description}</p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(price, language as 'pt' | 'en' | 'es')}
          </span>
          <span className="text-gray-500 ml-1">
            /{billing === 'annual' ? 'ano' : 'mês'}
          </span>
        </div>
        
        {billing === 'annual' && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {formatPrice(getMonthlyEquivalent(), language as 'pt' | 'en' | 'es')}/mês
            </p>
            {getSavings() > 0 && (
              <p className="text-sm text-green-600 font-semibold">
                Economize {formatPrice(getSavings(), language as 'pt' | 'en' | 'es')} por ano
              </p>
            )}
          </div>
        )}

        {/* Trial Period */}
        {plan.trialDays && plan.trialDays > 0 && (
          <div className="mt-2">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
              {plan.trialDays} dias grátis
            </span>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mb-6">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg 
                className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect(plan._id.toString(), billing)}
        disabled={loading || isCurrentPlan}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
          ${isCurrentPlan 
            ? 'bg-green-100 text-green-700 cursor-not-allowed' 
            : isPopular
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando...
          </div>
        ) : isCurrentPlan ? (
          'Plano Ativo'
        ) : (
          'Escolher Plano'
        )}
      </button>
    </div>
  );
};

export default PlanCard;