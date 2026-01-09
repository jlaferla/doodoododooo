import { ArrowRight, TrendingUp } from 'lucide-react';

interface CurrencyCardProps {
  currency: {
    code: string;
    name: string;
    symbol: string;
    flag: string;
    convertedAmount: number;
    finalAmount: number;
    convertedRate: number;
    marginAmount: number;
  };
  baseCurrency: string;
  baseSymbol: string;
  showMargin: boolean;
}

export function CurrencyCard({ currency, baseCurrency, baseSymbol, showMargin }: CurrencyCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{currency.flag}</div>
          <div>
            <h3 className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {currency.code}
            </h3>
            <p className="text-sm text-gray-500">{currency.name}</p>
          </div>
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <span>1 {baseCurrency}</span>
          <ArrowRight className="w-4 h-4" />
          <span>{currency.convertedRate.toFixed(4)} {currency.code}</span>
        </div>
        <div className="text-xs text-gray-400">Exchange Rate</div>
      </div>

      {/* Converted Amount */}
      <div className="space-y-2">
        {showMargin ? (
          <>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Base Amount:</span>
              <span className="text-gray-700">
                {currency.symbol}{currency.convertedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Margin:</span>
              <span className="text-green-600 text-sm">
                +{currency.symbol}{currency.marginAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-900">Total:</span>
              <span className="text-xl text-gray-900">
                {currency.symbol}{currency.finalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">You get:</span>
            <span className="text-2xl text-gray-900">
              {currency.symbol}{currency.finalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
