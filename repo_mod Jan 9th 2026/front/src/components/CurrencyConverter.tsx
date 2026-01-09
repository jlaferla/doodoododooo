import { useEffect, useMemo, useState } from 'react';
import { Search, TrendingUp, Globe, Percent } from 'lucide-react';
import { CurrencyCard } from './CurrencyCard';
import { fetchRates } from '@/lib/rates';

// Mock exchange rates (base USD = 1)
const EXCHANGE_RATES: Record<string, { rate: number; name: string; symbol: string; flag: string }> = {
  USD: { rate: 1, name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { rate: 0.92, name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { rate: 0.79, name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  JPY: { rate: 149.50, name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  AUD: { rate: 1.52, name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CAD: { rate: 1.35, name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  CHF: { rate: 0.88, name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  CNY: { rate: 7.24, name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  INR: { rate: 83.12, name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  MXN: { rate: 17.15, name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽' },
  BRL: { rate: 4.97, name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  ZAR: { rate: 18.45, name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  KRW: { rate: 1329.50, name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  SGD: { rate: 1.34, name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  HKD: { rate: 7.83, name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  NOK: { rate: 10.58, name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  SEK: { rate: 10.36, name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  DKK: { rate: 6.86, name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  NZD: { rate: 1.64, name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  THB: { rate: 34.20, name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  AED: { rate: 3.67, name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  SAR: { rate: 3.75, name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  TRY: { rate: 32.15, name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  RUB: { rate: 92.50, name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
};

const POPULAR_CURRENCIES = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('1000');
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [margin, setMargin] = useState<string>('0');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [liveRates, setLiveRates] = useState<Record<string, number> | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingRates(true);
      setRatesError(null);
      try {
        const data = await fetchRates();
        setLiveRates(data.conversion_rates ?? null);
      } catch (err: any) {
        setRatesError(err?.message ?? 'Failed to load live rates');
      } finally {
        setLoadingRates(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculatedRates = useMemo(() => {
    const baseRate = (liveRates?.[baseCurrency] ?? EXCHANGE_RATES[baseCurrency].rate);
    const numAmount = parseFloat(amount) || 0;
    const numMargin = parseFloat(margin) || 0;
    
    return Object.entries(EXCHANGE_RATES).map(([code, data]) => {
      const convertedRate = (data.rate / baseRate);
      const convertedAmount = numAmount * convertedRate;
      const marginAmount = convertedAmount * (numMargin / 100);
      const finalAmount = convertedAmount + marginAmount;
      
      return {
        code,
        ...data,
        convertedAmount,
        finalAmount,
        convertedRate,
        marginAmount,
      };
    });
  }, [amount, baseCurrency, margin]);

  const filteredRates = useMemo(() => {
    if (!searchTerm) return calculatedRates;
    
    const search = searchTerm.toLowerCase();
    return calculatedRates.filter(
      (currency) =>
        currency.code.toLowerCase().includes(search) ||
        currency.name.toLowerCase().includes(search)
    );
  }, [calculatedRates, searchTerm]);

  const popularRates = filteredRates.filter((r) => 
    POPULAR_CURRENCIES.includes(r.code) && r.code !== baseCurrency
  );
  
  const otherRates = filteredRates.filter((r) => 
    !POPULAR_CURRENCIES.includes(r.code) && r.code !== baseCurrency
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl tracking-tight text-gray-900">Currency Exchange</h1>
          </div>
          <p className="text-lg text-gray-600">
            Real-time exchange rates for global currencies
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            {/* Base Currency Selector */}
            <div>
              <label htmlFor="currency" className="block text-sm text-gray-700 mb-2">
                From Currency
              </label>
              <div className="relative">
                <select
                  id="currency"
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  {Object.entries(EXCHANGE_RATES).map(([code, data]) => (
                    <option key={code} value={code}>
                      {data.flag} {code} - {data.name}
                    </option>
                  ))}
                </select>
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Margin Input */}
            <div>
              <label htmlFor="margin" className="block text-sm text-gray-700 mb-2">
                Margin (%)
              </label>
              <div className="relative">
                <input
                  id="margin"
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                  step="0.1"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Summary Banner */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-gray-600">
                Converting from{' '}
                <span className="font-medium text-gray-900">
                  {EXCHANGE_RATES[baseCurrency].flag} {baseCurrency}
                </span>
              </div>
              {parseFloat(margin) > 0 && (
                <div className="text-sm text-blue-700">
                  <Percent className="w-4 h-4 inline mr-1" />
                  {margin}% margin applied
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search currencies..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Popular Currencies */}
        {popularRates.length > 0 && !searchTerm && (
          <div className="mb-8">
            <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Popular Currencies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularRates.map((currency) => (
                <CurrencyCard
                  key={currency.code}
                  currency={currency}
                  baseCurrency={baseCurrency}
                  baseSymbol={EXCHANGE_RATES[baseCurrency].symbol}
                  showMargin={parseFloat(margin) > 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Currencies */}
        <div>
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            {searchTerm ? 'Search Results' : 'All Currencies'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherRates.map((currency) => (
              <CurrencyCard
                key={currency.code}
                currency={currency}
                baseCurrency={baseCurrency}
                baseSymbol={EXCHANGE_RATES[baseCurrency].symbol}
                showMargin={parseFloat(margin) > 0}
              />
            ))}
          </div>
          
          {filteredRates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No currencies found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
