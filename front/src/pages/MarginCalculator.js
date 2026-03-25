// src/pages/MarginCalculator.js
import React, { useState, useEffect, useMemo } from 'react';
import currencyMapping from '../currencyMapping.json';
import CurrencyDropdown from '../CurrencyDropdown';
import './MarginCalculator.css';

const EXCLUDED    = ['ANG','BGN','FOK','GGP','HRK','IMP','JEP','KID','SLL','TVD','XDR','ZWL'];
const PRIORITY    = ['USD','EUR','GBP','AUD','CAD','ZAR','CHF','JPY','CNY','INR','AED','SGD','HKD','NZD'];
const HEROKU_BASE = 'https://fxping-d496a549fbaa.herokuapp.com';
const HISTORY_MIN = '2026-03-08'; // earliest date in daily_rates

const IconSwap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><line x1="3" y1="5" x2="21" y2="5"/>
    <polyline points="7 23 3 19 7 15"/><line x1="21" y1="19" x2="3" y2="19"/>
  </svg>
);

export default function MarginCalculator() {
  const [rates, setRates]             = useState({});
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [sendAmount, setSendAmount]     = useState('1000');
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [recvAmount, setRecvAmount]     = useState('');
  const [recvCurrency, setRecvCurrency] = useState('EUR');

  // SEO: update title, description, keywords and add JSON-LD for this page
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'FX Fee Checker — Hidden Exchange Rate Fee Calculator | FX Ping';

    const descEl = document.querySelector('meta[name="description"]');
    const prevDesc = descEl?.getAttribute('content') || '';
    descEl?.setAttribute('content',
      'Free FX Fee Checker — reveal the hidden fee, markup and true exchange rate your bank or transfer provider is charging. ' +
      'Enter what you send and receive to instantly calculate your real FX cost. ' +
      'Also known as: hidden exchange fee calculator, FX markup detector, true rate calculator, ' +
      'exchange rate transparency tool and currency transfer fee calculator. Powered by live mid-market rates.'
    );

    const kwEl = document.querySelector('meta[name="keywords"]');
    const prevKw = kwEl?.getAttribute('content') || '';
    kwEl?.setAttribute('content',
      'FX Fee Checker, Hidden FX Fee Calculator, Hidden Exchange Fee Calculator, Exchange Rate Fee Checker, ' +
      'Currency Transfer Fee Calculator, FX Transparency Calculator, Exchange Rate Transparency Tool, ' +
      'FX Markup Detector, Exchange Rate Markup Checker, True Rate Calculator, Real Exchange Rate Checker, ' +
      "What's My Real FX Rate, Currency Cost Calculator, FXPing Fee Checker, FXPing True Rate Tool, " +
      'FXPing Hidden Fee Calculator'
    );

    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'fee-checker-ld';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'FX Fee Checker',
      'alternateName': [
        'Hidden FX Fee Calculator', 'Hidden Exchange Fee Calculator',
        'Exchange Rate Fee Checker', 'Currency Transfer Fee Calculator',
        'FX Markup Detector', 'True Rate Calculator',
        'Real Exchange Rate Checker', 'Exchange Rate Transparency Tool',
        'FXPing Fee Checker', 'FXPing Hidden Fee Calculator'
      ],
      'url': 'https://fxping.co/fee-checker',
      'description': 'Calculate the hidden fee and true markup in your exchange rate. Find out your real FX rate and how much you are being charged for your currency transfer.',
      'applicationCategory': 'FinanceApplication',
      'operatingSystem': 'All',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
    });
    document.head.appendChild(ld);

    return () => {
      document.title = prevTitle;
      descEl?.setAttribute('content', prevDesc);
      kwEl?.setAttribute('content', prevKw);
      document.getElementById('fee-checker-ld')?.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    const url = selectedDate
      ? `${HEROKU_BASE}/rates/historical?date=${selectedDate}`
      : `${HEROKU_BASE}/rates`;
    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setFetchError(json.error); setLoading(false); return; }
        setRates(json.conversion_rates || {});
        setLoading(false);
      })
      .catch(() => { setFetchError('Unable to load rates. Please try again.'); setLoading(false); });
  }, [selectedDate]);

  const sortedCodes = useMemo(() => {
    const all = Object.keys(currencyMapping).filter(c => !EXCLUDED.includes(c) && rates[c]);
    const prio = PRIORITY.filter(c => all.includes(c));
    const rest = all.filter(c => !PRIORITY.includes(c)).sort();
    return [...prio, ...rest];
  }, [rates]);

  const handleSwap = () => {
    const prevSend = sendCurrency;
    const prevRecv = recvCurrency;
    const prevSendAmt = sendAmount;
    const prevRecvAmt = recvAmount;
    setSendCurrency(prevRecv);
    setRecvCurrency(prevSend);
    setSendAmount(prevRecvAmt);
    setRecvAmount(prevSendAmt);
  };

  // Clip amount string to at most `dp` decimal places
  const clipDecimals = (val, dp) => {
    if (!val.includes('.')) return val;
    const [int, dec] = val.split('.');
    if (dp === 0) return int;
    return dec.length > dp ? int + '.' + dec.slice(0, dp) : val;
  };

  // When send currency changes, clip any excess decimals from the amount
  useEffect(() => {
    const meta = currencyMapping[sendCurrency] || {};
    const dp = meta.minorUnits === 0 ? 0 : meta.minorUnits === 3 ? 3 : 2;
    setSendAmount(prev => clipDecimals(prev, dp));
  }, [sendCurrency]); // eslint-disable-line react-hooks/exhaustive-deps

  // When receive currency changes, clip any excess decimals from the amount
  useEffect(() => {
    const meta = currencyMapping[recvCurrency] || {};
    const dp = meta.minorUnits === 0 ? 0 : meta.minorUnits === 3 ? 3 : 2;
    setRecvAmount(prev => clipDecimals(prev, dp));
  }, [recvCurrency]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAmountChange = (setter, dp) => (e) => {
    const v = e.target.value.replace(/,/g, '');
    const regex = dp === 0
      ? /^[0-9]*$/
      : new RegExp(`^[0-9]*(\\.[0-9]{0,${dp}})?$`);
    if (v === '' || regex.test(v)) setter(v);
  };

  const result = useMemo(() => {
    if (!rates[sendCurrency] || !rates[recvCurrency]) return null;
    const sAmt = parseFloat(sendAmount);
    const rAmt = parseFloat(recvAmount);
    if (!sAmt || !rAmt || sAmt <= 0 || rAmt <= 0) return null;

    // Mid-market: recvCurrency per 1 sendCurrency
    const midRate     = rates[recvCurrency] / rates[sendCurrency];
    // Implied rate from actual amounts
    const impliedRate = rAmt / sAmt;
    // Margin %: positive = customer gets less (provider profits)
    const marginPct   = (1 - impliedRate / midRate) * 100;
    // What customer would receive at mid-market
    const midRecv     = sAmt * midRate;
    // Cost expressed in both currencies
    const costRecv    = midRecv - rAmt;
    const costSend    = costRecv / midRate;

    return { midRate, impliedRate, marginPct, midRecv, costRecv, costSend };
  }, [rates, sendCurrency, recvCurrency, sendAmount, recvAmount]);

  const sendMeta = currencyMapping[sendCurrency] || {};
  const recvMeta = currencyMapping[recvCurrency] || {};
  const sendDp   = sendMeta.minorUnits === 0 ? 0 : sendMeta.minorUnits === 3 ? 3 : 2;
  const recvDp   = recvMeta.minorUnits === 0 ? 0 : recvMeta.minorUnits === 3 ? 3 : 2;

  // Gauge: maps 0–10% to 0–100% of the track; clamped at both ends
  const gaugePos = result
    ? Math.min(Math.max(result.marginPct, 0), 10) / 10 * 100
    : null;

  const marginColor = result
    ? result.marginPct < 0  ? '#16a34a'
    : result.marginPct < 1  ? '#16a34a'
    : result.marginPct < 3  ? '#2563eb'
    : result.marginPct < 5  ? '#d97706'
    : '#dc2626'
    : '#2563eb';

  const marginLabel = !result ? '' :
    result.marginPct < 0  ? 'Favourable'    :
    result.marginPct < 1  ? 'Excellent'      :
    result.marginPct < 3  ? 'Typical retail' :
    result.marginPct < 5  ? 'Above average'  :
    'Expensive';

  return (
    <div className="mc-page">

      <div className="mc-body">

        <div className="mc-page-header">
          <h1 className="mc-page-title">Fee Checker</h1>
          <p className="mc-page-subtitle">Enter the amount you have sent and received to reveal the estimated fee in your exchange rate.</p>
        </div>

        {/* ── Date picker ── */}
        <div className="mc-date-row">
          <label className="mc-date-label">Rates as of</label>
          <input
            type="date"
            className="mc-date-input"
            value={selectedDate}
            min={HISTORY_MIN}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setSelectedDate(e.target.value)}
          />
          {selectedDate !== new Date().toISOString().slice(0, 10) && (
            <button className="mc-date-clear" onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))} title="Use live rates">
              Live rates
            </button>
          )}
        </div>

        {fetchError && <p className="mc-error">{fetchError}</p>}
        {loading    && <p className="mc-loading">Loading {selectedDate ? `rates for ${selectedDate}` : 'live rates'}…</p>}

        {!loading && !fetchError && (
          <>
            {/* ── Input card ── */}
            <div className="mc-card">

              {/* Send row */}
              <div className="mc-field-group">
                <label className="mc-field-label">You send</label>
                <div className="mc-field-row">
                  <input
                    type="text" inputMode="decimal"
                    className="mc-amount-input"
                    value={sendAmount}
                    onChange={handleAmountChange(setSendAmount, sendDp)}
                    placeholder="0.00"
                  />
                  <CurrencyDropdown
                    value={sendCurrency}
                    onChange={setSendCurrency}
                    codes={sortedCodes}
                    variant="page"
                  />
                </div>
                {sendMeta.currency && <span className="mc-currency-name">{sendMeta.currency}</span>}
              </div>

              {/* Swap divider */}
              <div className="mc-swap-row">
                <div className="mc-swap-line" />
                <button className="mc-swap-btn" onClick={handleSwap} title="Swap currencies" type="button">
                  <IconSwap />
                </button>
                <div className="mc-swap-line" />
              </div>

              {/* Receive row */}
              <div className="mc-field-group">
                <label className="mc-field-label">They give you</label>
                <div className="mc-field-row">
                  <input
                    type="text" inputMode="decimal"
                    className="mc-amount-input"
                    value={recvAmount}
                    onChange={handleAmountChange(setRecvAmount, recvDp)}
                    placeholder="0.00"
                  />
                  <CurrencyDropdown
                    value={recvCurrency}
                    onChange={setRecvCurrency}
                    codes={sortedCodes}
                    variant="page"
                  />
                </div>
                {recvMeta.currency && <span className="mc-currency-name">{recvMeta.currency}</span>}
              </div>
            </div>

            {/* ── Wise affiliate banner ── */}
            {result && (
              <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                <a href="https://wise.prf.hn/click/camref:1011l5EJVV/creativeref:1101l102638/pubref:fee-checker" rel="sponsored noopener noreferrer" target="_blank">
                  <img
                    src="https://wise-creative.prf.hn/source/camref:1011l5EJVV/creativeref:1101l102638"
                    width="1456"
                    height="180"
                    border="0"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    alt="Wise"
                  />
                </a>
              </div>
            )}

            {/* ── Results ── */}
            {result && (
              <div className="mc-results">
                <div className="mc-results-header">
                  <span className="mc-results-label">Breakdown</span>
                </div>

                <div className="mc-stats-row">
                  <div className="mc-stat">
                    <span className="mc-stat-label">Mid-market rate</span>
                    <span className="mc-stat-value">{result.midRate.toFixed(4)}</span>
                    <span className="mc-stat-sub">1 {sendCurrency} = {result.midRate.toFixed(4)} {recvCurrency}</span>
                  </div>
                  <div className="mc-stat">
                    <span className="mc-stat-label">Your rate</span>
                    <span className="mc-stat-value">{result.impliedRate.toFixed(4)}</span>
                    <span className="mc-stat-sub">1 {sendCurrency} = {result.impliedRate.toFixed(4)} {recvCurrency}</span>
                  </div>
                  <div className="mc-stat">
                    <span className="mc-stat-label">Estimated margin</span>
                    <span className="mc-stat-value" style={{ color: marginColor }}>
                      {result.marginPct < 0 ? '' : ''}{Math.abs(result.marginPct).toFixed(2)}%
                    </span>
                    <span className="mc-stat-sub" style={{ color: marginColor, fontWeight: 600 }}>
                      {marginLabel}
                    </span>
                  </div>
                </div>

                {/* ── Fee gauge ── */}
                <div className="mc-gauge">
                  <div className="mc-gauge-track">
                    <div
                      className="mc-gauge-marker"
                      style={{ left: `${gaugePos}%`, borderColor: marginColor }}
                    />
                  </div>
                  <div className="mc-gauge-ticks">
                    <span style={{ left: '0%'   }}>0%</span>
                    <span style={{ left: '10%'  }}>1%</span>
                    <span style={{ left: '30%'  }}>3%</span>
                    <span style={{ left: '50%'  }}>5%</span>
                    <span style={{ left: '100%' }}>10%+</span>
                  </div>
                </div>

                <div className="mc-breakdown">
                  <div className="mc-breakdown-row">
                    <span className="mc-breakdown-label">At mid-market you'd receive</span>
                    <span className="mc-breakdown-value">
                      {result.midRecv.toLocaleString(undefined, { minimumFractionDigits: recvDp, maximumFractionDigits: recvDp })} {recvCurrency}
                    </span>
                  </div>
                  <div className="mc-breakdown-row">
                    <span className="mc-breakdown-label">You're actually receiving</span>
                    <span className="mc-breakdown-value">
                      {parseFloat(recvAmount).toLocaleString(undefined, { minimumFractionDigits: recvDp, maximumFractionDigits: recvDp })} {recvCurrency}
                    </span>
                  </div>

                  {result.costRecv > 0.005 && (
                    <div className="mc-breakdown-row mc-breakdown-cost">
                      <span className="mc-breakdown-label">Hidden cost</span>
                      <span className="mc-breakdown-value" style={{ color: marginColor }}>
                        {result.costRecv.toLocaleString(undefined, { minimumFractionDigits: recvDp, maximumFractionDigits: recvDp })} {recvCurrency}
                        <span className="mc-breakdown-also">
                          {' '}≈ {result.costSend.toLocaleString(undefined, { minimumFractionDigits: sendDp, maximumFractionDigits: sendDp })} {sendCurrency}
                        </span>
                      </span>
                    </div>
                  )}

                  {result.costRecv < -0.005 && (
                    <div className="mc-breakdown-row">
                      <span className="mc-breakdown-label">Better than mid-market by</span>
                      <span className="mc-breakdown-value" style={{ color: '#16a34a' }}>
                        {Math.abs(result.costRecv).toLocaleString(undefined, { minimumFractionDigits: recvDp, maximumFractionDigits: recvDp })} {recvCurrency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Empty prompt ── */}
            {!result && (
              <div className="mc-prompt">
                <p>Enter both amounts above to see the estimated margin.</p>
              </div>
            )}

            {/* ── Info box ── */}
            <div className="mc-info-box">
              <p className="mc-info-text">
                <strong>What is an FX fee?</strong> Banks and money transfer providers rarely exchange currency at the
                mid-market rate. They apply a hidden markup — the margin — which is how they profit on every transaction.
                A fee under 1% is excellent; 1–3% is typical retail; above 5% is expensive.
                This tool uses live mid-market rates to reveal the true cost buried in your quote.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
