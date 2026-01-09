import { ArrowRight, TrendingUp, Percent } from 'lucide-react';

interface RateCardProps {
  currency: {
    code: string;
    name: string;
    location: string;
    numericCode: string;
    flag: string;
    convertedRate: number;
    convertedAmount: number;
    marginRate: number;
    marginAmount: number;
  };
  baseCurrency: string;
  showMargin: boolean;
}

export function RateCard({ currency, baseCurrency, showMargin }: RateCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currency.flag}</span>
          <div>
            <h3 className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {currency.code}
            </h3>
            <p className="text-xs text-gray-500">{currency.name}</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
          #{currency.numericCode}
        </span>
      </div>

      {/* Location */}
      <div className="mb-4 text-sm text-blue-600">
        📍 {currency.location}
      </div>

      {/* Exchange Rate */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500 uppercase">Exchange Rate</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">1 {baseCurrency}</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </div>
        </div>
        <div className="text-xl text-gray-900">
          {currency.convertedRate.toFixed(4)} <span className="text-base text-gray-600">{currency.code}</span>
        </div>
      </div>

      {/* Amounts */}
      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Converted Amount</div>
          <div className="text-2xl text-gray-900">
            {currency.convertedAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {showMargin && (
          <>
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <Percent className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500 uppercase">With Margin</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Rate: {currency.marginRate.toFixed(4)}</div>
              <div className="text-xl text-green-700">
                {currency.marginAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
