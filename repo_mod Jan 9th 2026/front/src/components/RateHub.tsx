import { useEffect, useMemo, useState } from 'react';
import { Download, Search, TrendingUp, RefreshCw } from 'lucide-react';
import { RateCard } from './RateCard';
import { fetchRates } from '@/lib/rates';

// Mock exchange rates data with location and numeric codes
const EXCHANGE_RATES: Record<string, {
  rate: number;
  name: string;
  location: string;
  numericCode: string;
  flag: string;
}> = {
  USD: { rate: 1, name: 'United States dollar', location: 'United States', numericCode: '840', flag: '🇺🇸' },
  EUR: { rate: 0.8574, name: 'Euro', location: 'European Union', numericCode: '978', flag: '🇪🇺' },
  GBP: { rate: 0.7442, name: 'Pound sterling', location: 'United Kingdom', numericCode: '826', flag: '🇬🇧' },
  AUD: { rate: 1.4930, name: 'Australian dollar', location: 'Australia', numericCode: '36', flag: '🇦🇺' },
  CAD: { rate: 1.3862, name: 'Canadian dollar', location: 'Canada', numericCode: '124', flag: '🇨🇦' },
  AED: { rate: 3.6725, name: 'United Arab Emirates dirham', location: 'United Arab Emirates', numericCode: '784', flag: '🇦🇪' },
  ZAR: { rate: 16.5189, name: 'South African rand', location: 'South Africa & Eswatini', numericCode: '710', flag: '🇿🇦' },
  CLP: { rate: 902.27, name: 'Chilean peso', location: 'Chile', numericCode: '990', flag: '🇨🇱' },
  JPY: { rate: 149.50, name: 'Japanese Yen', location: 'Japan', numericCode: '392', flag: '🇯🇵' },
  CHF: { rate: 0.88, name: 'Swiss Franc', location: 'Switzerland', numericCode: '756', flag: '🇨🇭' },
  CNY: { rate: 7.24, name: 'Chinese Yuan', location: 'China', numericCode: '156', flag: '🇨🇳' },
  INR: { rate: 83.12, name: 'Indian Rupee', location: 'India', numericCode: '356', flag: '🇮🇳' },
  MXN: { rate: 17.15, name: 'Mexican Peso', location: 'Mexico', numericCode: '484', flag: '🇲🇽' },
  BRL: { rate: 4.97, name: 'Brazilian Real', location: 'Brazil', numericCode: '986', flag: '🇧🇷' },
  KRW: { rate: 1329.50, name: 'South Korean Won', location: 'South Korea', numericCode: '410', flag: '🇰🇷' },
  SGD: { rate: 1.34, name: 'Singapore Dollar', location: 'Singapore', numericCode: '702', flag: '🇸🇬' },
  HKD: { rate: 7.83, name: 'Hong Kong Dollar', location: 'Hong Kong', numericCode: '344', flag: '🇭🇰' },
  NOK: { rate: 10.58, name: 'Norwegian Krone', location: 'Norway', numericCode: '578', flag: '🇳🇴' },
  SEK: { rate: 10.36, name: 'Swedish Krona', location: 'Sweden', numericCode: '752', flag: '🇸🇪' },
  DKK: { rate: 6.86, name: 'Danish Krone', location: 'Denmark', numericCode: '208', flag: '🇩🇰' },
  NZD: { rate: 1.64, name: 'New Zealand Dollar', location: 'New Zealand', numericCode: '554', flag: '🇳🇿' },
  THB: { rate: 34.20, name: 'Thai Baht', location: 'Thailand', numericCode: '764', flag: '🇹🇭' },
  TRY: { rate: 32.15, name: 'Turkish Lira', location: 'Turkey', numericCode: '949', flag: '🇹🇷' },
  RUB: { rate: 92.50, name: 'Russian Ruble', location: 'Russia', numericCode: '643', flag: '🇷🇺' },
  PLN: { rate: 3.95, name: 'Polish Zloty', location: 'Poland', numericCode: '985', flag: '🇵🇱' },
  MYR: { rate: 4.47, name: 'Malaysian Ringgit', location: 'Malaysia', numericCode: '458', flag: '🇲🇾' },
  IDR: { rate: 15678.50, name: 'Indonesian Rupiah', location: 'Indonesia', numericCode: '360', flag: '🇮🇩' },
  PHP: { rate: 56.23, name: 'Philippine Peso', location: 'Philippines', numericCode: '608', flag: '🇵🇭' },
  CZK: { rate: 22.45, name: 'Czech Koruna', location: 'Czech Republic', numericCode: '203', flag: '🇨🇿' },
  ILS: { rate: 3.65, name: 'Israeli Shekel', location: 'Israel', numericCode: '376', flag: '🇮🇱' },
  HUF: { rate: 354.20, name: 'Hungarian Forint', location: 'Hungary', numericCode: '348', flag: '🇭🇺' },
};

export function RateHub() {
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [amount, setAmount] = useState<string>('1');
  const [margin, setMargin] = useState<string>('0');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [liveRates, setLiveRates] = useState<Record<string, number> | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  const refreshRates = async () => {
    setLoadingRates(true);
    setRatesError(null);
    try {
      const data = await fetchRates();
      setLiveRates(data.conversion_rates ?? null);
      if (data.time_last_update_utc) {
        setLastUpdated(data.time_last_update_utc);
      } else if (data.time_last_update_unix) {
        setLastUpdated(new Date(data.time_last_update_unix * 1000).toUTCString());
      } else {
        setLastUpdated(new Date().toUTCString());
      }
    } catch (err: any) {
      setRatesError(err?.message ?? 'Failed to load live rates');
      // Keep the built-in mock rates as a fallback.
      if (!lastUpdated) setLastUpdated(new Date().toUTCString());
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    refreshRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculatedRates = useMemo(() => {
    const baseRate = (liveRates?.[baseCurrency] ?? EXCHANGE_RATES[baseCurrency].rate);
    const numAmount = parseFloat(amount) || 0;
    const numMargin = parseFloat(margin) || 0;

    return Object.entries(EXCHANGE_RATES).map(([code, data]) => {
      const sourceRate = (liveRates?.[code] ?? data.rate);
      const convertedRate = sourceRate / baseRate;
      const convertedAmount = numAmount * convertedRate;
      const marginRate = convertedRate * (1 + numMargin / 100);
      const marginAmount = numAmount * marginRate;

      return {
        code,
        ...data,
        convertedRate,
        convertedAmount,
        marginRate,
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
        currency.name.toLowerCase().includes(search) ||
        currency.location.toLowerCase().includes(search)
    );
  }, [calculatedRates, searchTerm]);

  const handleExport = () => {
    // Mock export functionality
    alert('Export functionality would download CSV/Excel file');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl text-gray-900 mb-2">Rate Hub</h1>
        <button
          type="button"
          onClick={refreshRates}
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh rates"
        >
          <RefreshCw className={`w-4 h-4 ${loadingRates ? "animate-spin" : ""}`} />
          <span>
            Updated: {lastUpdated || "Loading..."}
            {ratesError ? " (offline)" : ""}
          </span>
        </button>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex flex-wrap items-end gap-4">
          {/* Base Currency */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="baseCurrency" className="block text-sm text-gray-700 mb-2">
              Base Currency:
            </label>
            <select
              id="baseCurrency"
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.keys(EXCHANGE_RATES).map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="amount" className="block text-sm text-gray-700 mb-2">
              Amount ({baseCurrency}):
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
              step="0.01"
            />
          </div>

          {/* Margin */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="margin" className="block text-sm text-gray-700 mb-2">
              Margin (%):
            </label>
            <input
              id="margin"
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              step="0.1"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by currency code, name, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              viewMode === 'cards'
                ? 'bg-[#1e3a5f] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              viewMode === 'table'
                ? 'bg-[#1e3a5f] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredRates.length} {filteredRates.length === 1 ? 'currency' : 'currencies'}
      </div>

      {/* Currency Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRates.map((currency) => (
            <RateCard
              key={currency.code}
              currency={currency}
              baseCurrency={baseCurrency}
              showMargin={parseFloat(margin) !== 0}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Numeric #
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-right text-xs text-gray-700 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs text-gray-700 uppercase tracking-wider">
                    Converted Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs text-gray-700 uppercase tracking-wider">
                    Margined Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs text-gray-700 uppercase tracking-wider">
                    Margined Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRates.map((currency) => (
                  <tr key={currency.code} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{currency.flag}</span>
                        <span className="text-blue-600">{currency.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{currency.numericCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{currency.name}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">{currency.location}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {currency.convertedRate.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {currency.convertedAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {currency.marginRate.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {currency.marginAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredRates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No currencies found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
