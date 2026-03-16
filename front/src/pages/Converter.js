// src/pages/Converter.js — FX Ping homepage currency converter
import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CurrencyDropdown from '../CurrencyDropdown';
import currencyMapping from '../currencyMapping.json';
import './Converter.css';

// Format raw number string with comma separators (integer part only)
const formatWithCommas = raw => {
  if (!raw) return raw;
  const [int, dec] = raw.split('.');
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec !== undefined ? `${formatted}.${dec}` : formatted;
};

const RATES_URL = 'https://fxping-d496a549fbaa.herokuapp.com/rates';

const IconSwap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><line x1="3" y1="5" x2="21" y2="5"/>
    <polyline points="7 23 3 19 7 15"/><line x1="21" y1="19" x2="3" y2="19"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconTable = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/><line x1="15" y1="9" x2="15" y2="21"/>
  </svg>
);
const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const TOOLS = [
  {
    icon: <IconTable />,
    title: 'Live Rates Table',
    description: 'Live exchange rates for 150+ currencies. Apply a custom margin % across every rate simultaneously and export to CSV, PDF or JSON.',
    link: '/rates',
    label: 'See all rates',
    accent: '#2563eb',
  },
  {
    icon: <IconShield />,
    title: 'Fee Checker',
    description: 'Enter what you sent and received to instantly reveal the estimated markup your bank or transfer provider charged you.',
    link: '/fee-checker',
    label: 'Check a fee',
    accent: '#16a34a',
  },
  {
    icon: <IconChart />,
    title: 'Historical Charts',
    description: '7-day to 1-year price history for major currency pairs. Interactive chart with crosshair, period stats, and trend data.',
    link: '/currency/GBP',
    label: 'View a chart',
    accent: '#7c3aed',
  },
  {
    icon: <IconBook />,
    title: 'FX Explained',
    description: 'Plain-English guides to understanding foreign exchange — mid-market rates, currency pegs, why rates move, and more.',
    link: '/blog',
    label: 'Read the blog',
    accent: '#d97706',
  },
];

function getDp(code) {
  const u = Number(currencyMapping[code]?.minorUnits ?? 2);
  return u === 0 ? 0 : u === 3 ? 3 : 2;
}

const priority = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'AED', 'ZAR'];

export default function Converter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rates,     setRates]     = useState({});
  const [codes,     setCodes]     = useState([]);
  const [fromCcy,   setFromCcy]   = useState(() => {
    const p = searchParams.get('from')?.toUpperCase();
    return (p && currencyMapping[p]) ? p : localStorage.getItem('fxping_base') || 'USD';
  });
  const [toCcy,     setToCcy]     = useState(() => {
    const p = searchParams.get('to')?.toUpperCase();
    return (p && currencyMapping[p]) ? p : 'EUR';
  });
  const [amount,    setAmount]    = useState(() => {
    const p = searchParams.get('amount')?.replace(/,/g, '');
    return (p && /^[0-9]+(\.[0-9]+)?$/.test(p)) ? p : '1';
  });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [swapCount, setSwapCount] = useState(0);
  const amountRef = useRef(null);

  // SEO
  useEffect(() => {
    const prev = document.title;
    document.title = 'FX Ping — Free Currency Converter | Live Exchange Rates';
    const desc = document.querySelector('meta[name="description"]');
    const prevDesc = desc?.getAttribute('content');
    if (desc) desc.setAttribute('content', 'Convert any currency instantly with live mid-market rates. Free currency converter covering 150+ currencies — no hidden fees, no markup.');
    return () => {
      document.title = prev;
      if (desc && prevDesc) desc.setAttribute('content', prevDesc);
    };
  }, []);

  // Fetch rates
  useEffect(() => {
    fetch(RATES_URL)
      .then(r => r.json())
      .then(json => {
        const r = json.conversion_rates || {};
        setRates(r);
        const all = Object.keys(r);
        setCodes([...priority.filter(c => all.includes(c)), ...all.filter(c => !priority.includes(c)).sort()]);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  // Sync state → URL (replaceState so back button isn't polluted)
  useEffect(() => {
    setSearchParams(
      { from: fromCcy, to: toCcy, amount: amount || '1' },
      { replace: true }
    );
  }, [fromCcy, toCcy, amount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clip decimals when from currency changes
  useEffect(() => {
    const dp = getDp(fromCcy);
    if (amount.includes('.')) {
      const [int, dec] = amount.split('.');
      if (dp === 0) setAmount(int);
      else if (dec.length > dp) setAmount(int + '.' + dec.slice(0, dp));
    }
  }, [fromCcy]); // eslint-disable-line react-hooks/exhaustive-deps

  const fromDp   = getDp(fromCcy);
  const toDp     = getDp(toCcy);
  const num      = parseFloat(amount) || 0;
  const result   = rates[fromCcy] && rates[toCcy] && num ? num * (rates[toCcy] / rates[fromCcy]) : null;
  const midRate  = rates[fromCcy] && rates[toCcy] ? rates[toCcy] / rates[fromCcy] : null;
  const fromName = currencyMapping[fromCcy]?.currency;
  const toName   = currencyMapping[toCcy]?.currency;

  const handleAmountChange = e => {
    const input = amountRef.current;
    const cursorPos = input ? input.selectionStart : 0;
    const oldVal = input ? input.value : '';
    const commasBeforeCursor = (oldVal.slice(0, cursorPos).match(/,/g) || []).length;

    const raw = e.target.value.replace(/,/g, '');

    // 12 digit limit (digits only, excluding decimal point)
    if (raw.replace(/\D/g, '').length > 12) return;

    const re = fromDp === 0 ? /^[0-9]*$/ : new RegExp(`^[0-9]*(\\.[0-9]{0,${fromDp}})?$`);
    if (raw === '' || re.test(raw)) {
      setAmount(raw);
      requestAnimationFrame(() => {
        if (!amountRef.current) return;
        const newVal = amountRef.current.value;
        const commasInNew = (newVal.slice(0, cursorPos).match(/,/g) || []).length;
        const newCursor = cursorPos - commasBeforeCursor + commasInNew;
        amountRef.current.setSelectionRange(newCursor, newCursor);
      });
    }
  };

  const handleSwap = () => {
    setFromCcy(toCcy);
    setToCcy(fromCcy);
    setSwapCount(n => n + 1);
  };

  const handleFromChange = c => {
    setFromCcy(c);
    localStorage.setItem('fxping_base', c);
  };

  // Swap icon rotates 180deg per click, smoothly alternating direction
  const swapRotation = swapCount * 180;

  return (
    <div className="cv-page">

      <div className="cv-hero">
        <h1 className="cv-hero-title">Currency Converter</h1>
        <p className="cv-hero-sub">Live mid-market rates for 150+ currencies — free, no markup</p>
      </div>

      <div className="cv-card">
        {error && <p className="cv-error">Could not load live rates. Please refresh and try again.</p>}

        {/* From row */}
        <div className="cv-field-group">
          <label className="cv-field-label">From</label>
          <div className="cv-field-row">
            <input
              ref={amountRef}
              className="cv-amount-input"
              type="text"
              inputMode="decimal"
              value={formatWithCommas(amount)}
              onChange={handleAmountChange}
              placeholder="0.00"
              aria-label="Amount"
            />
            <CurrencyDropdown
              value={fromCcy}
              onChange={handleFromChange}
              codes={codes}
              variant="page"
            />
          </div>
          {fromName && <span className="cv-currency-name">{fromName}</span>}
        </div>

        {/* Swap */}
        <div className="cv-swap-row">
          <div className="cv-swap-line" />
          <button
            className="cv-swap-btn"
            onClick={handleSwap}
            title="Swap currencies"
            aria-label="Swap currencies"
          >
            <span
              className="cv-swap-icon"
              style={{ transform: `rotate(${swapRotation}deg)` }}
            >
              <IconSwap />
            </span>
          </button>
          <div className="cv-swap-line" />
        </div>

        {/* To row */}
        <div className="cv-field-group">
          <label className="cv-field-label">To</label>
          <div className="cv-field-row">
            <div className="cv-result" aria-live="polite">
              {loading
                ? <span className="cv-result-loading">Loading…</span>
                : result !== null
                  ? result.toLocaleString(undefined, { minimumFractionDigits: toDp, maximumFractionDigits: toDp })
                  : '—'
              }
            </div>
            <CurrencyDropdown
              value={toCcy}
              onChange={setToCcy}
              codes={codes}
              variant="page"
            />
          </div>
          {toName && <span className="cv-currency-name">{toName}</span>}
        </div>

        {/* Mid-rate note */}
        {midRate !== null && (
          <div className="cv-rate-note">
            <span>1 {fromCcy} = {midRate.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {toCcy}</span>
            <span className="cv-rate-badge">Mid-market rate</span>
          </div>
        )}
      </div>

      {/* Tools showcase */}
      <div className="cv-tools-section">
        <h2 className="cv-tools-heading">Everything FX Ping offers</h2>
        <div className="cv-tools-grid">
          {TOOLS.map(tool => (
            <Link key={tool.link} to={tool.link} className="cv-tool-card">
              <div className="cv-tool-icon" style={{ color: tool.accent, background: `${tool.accent}18` }}>
                {tool.icon}
              </div>
              <div className="cv-tool-body">
                <h3 className="cv-tool-title">{tool.title}</h3>
                <p className="cv-tool-desc">{tool.description}</p>
                <span className="cv-tool-link" style={{ color: tool.accent }}>
                  {tool.label} <IconArrow />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
