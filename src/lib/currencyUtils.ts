/**
 * Currency utilities for formatting prices based on language
 */

export const getCurrencyConfig = (language: 'pt' | 'en' | 'es') => {
  switch (language) {
    case 'pt':
      return {
        code: 'BRL',
        symbol: 'R$',
        locale: 'pt-BR',
      };
    case 'en':
      return {
        code: 'USD',
        symbol: '$',
        locale: 'en-US',
      };
    case 'es':
      return {
        code: 'EUR',
        symbol: '€',
        locale: 'es-ES',
      };
    default:
      return {
        code: 'BRL',
        symbol: 'R$',
        locale: 'pt-BR',
      };
  }
};

export const formatPrice = (value: number, language: 'pt' | 'en' | 'es' = 'pt'): string => {
  const config = getCurrencyConfig(language);
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPriceSimple = (value: number, language: 'pt' | 'en' | 'es' = 'pt'): string => {
  const config = getCurrencyConfig(language);
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  return `${config.symbol} ${formatted}`;
};
