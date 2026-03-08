// src/App.js  — FX Ping: Figma aesthetic + full original functionality
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import './App.css';
import 'flag-icons/css/flag-icons.min.css';
import currencyMapping from './currencyMapping.json';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from './Header';
import Footer from './Footer';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import CurrencyDetail from './pages/CurrencyDetail';

// ── Inline SVG icons (no extra dependency) ──────────────────────────────────
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconTable = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/><line x1="15" y1="9" x2="15" y2="21"/>
  </svg>
);
const IconCards = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

// ── RateCard component ───────────────────────────────────────────────────────
function RateCard({ currency, showMargin, margin, selectedBase }) {
  const units    = Number(currencyMapping[currency.code]?.minorUnits ?? 2);
  const decimals = units === 0 ? 0 : units === 3 ? 3 : 2;
  const rateDp   = 4;

  return (
    <Link to={`/currency/${currency.code}`} state={{ base: selectedBase }} className="rate-card">
      <div className="card-header">
        {currency.countryCode && (
          <span className={`fi fi-${currency.countryCode} card-flag`}></span>
        )}
        <div>
          <div className="card-code">{currency.code}</div>
          <div className="card-name">{currency.name}</div>
        </div>
      </div>

      <hr className="card-divider" />

      <div className="card-rate-row">
        <span className="card-label">Rate</span>
        <span className="card-value">
          {currency.convertedRate.toLocaleString(undefined, { minimumFractionDigits: rateDp, maximumFractionDigits: rateDp })}
        </span>
      </div>
      <div className="card-rate-row">
        <span className="card-label">Amount</span>
        <span className="card-value-lg">
          {currency.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        </span>
      </div>

      {showMargin && (
        <div className="card-margin-block">
          <div className="card-margin-label">+ {margin}% margin</div>
          <div className="card-rate-row">
            <span className="card-label" style={{color:'#16a34a'}}>Rate</span>
            <span className="card-value-green">
              {currency.marginRate.toLocaleString(undefined, { minimumFractionDigits: rateDp, maximumFractionDigits: rateDp })}
            </span>
          </div>
          <div className="card-rate-row">
            <span className="card-label" style={{color:'#16a34a'}}>Amount</span>
            <span className="card-value-green">
              {currency.marginAmount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}


// ── Main UI ──────────────────────────────────────────────────────────────────
function ConversionUI() {
  const [data, setData]                   = useState({ conversion_rates: {} });
  const [amount, setAmount]               = useState('1');
  const [selectedBase, setSelectedBase]   = useState(() => localStorage.getItem('fxping_base') || 'USD');
  const [margin, setMargin]               = useState('0');
  const [sortBy, setSortBy]               = useState('code');
  const [sortOrder, setSortOrder]         = useState('asc');
  const [filterText, setFilterText]       = useState('');
  const [rateFilterComparison, setRateFilterComparison] = useState('none');
  const [rateFilterValue, setRateFilterValue]           = useState('');
  const [error, setError]                 = useState(null);
  const [showRateFilter, setShowRateFilter]             = useState(false);
  const [viewMode, setViewMode]           = useState(() => localStorage.getItem('fxping_view') || 'table');
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const exportMenuRef = useRef();
  const [searchTerm, setSearchTerm]       = useState('');

  const rateFilterRef     = useRef();

  // Priority base currency order
  const baseCodes       = Object.keys(data.conversion_rates);
  const priority        = ['USD','EUR','GBP','AUD','CAD','ZAR'];
  const sortedBaseCodes = [
    ...priority.filter(c => baseCodes.includes(c)),
    ...baseCodes.filter(c => !priority.includes(c)).sort()
  ];

  ReactGA.initialize('G-5RN2X8MD4P');
  ReactGA.send('pageview');

  // Click-outside for export menu
  useEffect(() => {
    const handler = e => {
      if (exportMenuVisible && exportMenuRef.current && !exportMenuRef.current.contains(e.target))
        setExportMenuVisible(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exportMenuVisible]);

  // Fetch live rates
  useEffect(() => {
    fetch('https://fxping-d496a549fbaa.herokuapp.com/rates')
      .then(r => r.json())
      .then(json => {
        setData(json);
        if (!json.conversion_rates[selectedBase]) setSelectedBase(json.base_code);
      })
      .catch(err => setError(err.message));
  }, [selectedBase]);

  // Click-outside closers
  useEffect(() => {
    const h = e => { if (showRateFilter && rateFilterRef.current && !rateFilterRef.current.contains(e.target)) setShowRateFilter(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, [showRateFilter]);
  const handleSortClick = col => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('asc'); }
  };

  const handleAmountChange = e => {
    const raw = e.target.value.replace(/,/g, '');
    const digitCount = raw.replace(/\D/g, '').length;
    if (raw === '' || raw === '.' || (/^[0-9]+(\.[0-9]{0,3})?$/.test(raw) && digitCount <= 12)) setAmount(raw);
  };

  function getFilteredSortedCodes() {
    const exclude = ['ANG','BGN','FOK','GGP','HRK','IMP','JEP','KID','SLL','TVD','XDR','ZWL'];

    let codes = Object.keys(data.conversion_rates).filter(c => {
      // 1. Remove excluded junk currencies
      if (exclude.includes(c)) return false;

      // 2. Column-level inline code filter
      if (filterText && !c.toLowerCase().includes(filterText.toLowerCase())) return false;

      // 3. Global search bar — each filter is an independent if/return false
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const meta = currencyMapping[c];
        const aliasMatch = (meta?.aliases || []).some(a => a.includes(s));
        const match =
          c.toLowerCase().includes(s) ||
          (meta?.currency || '').toLowerCase().includes(s) ||
          (meta?.location || '').toLowerCase().includes(s) ||
          (meta?.numericCode || '').includes(s) ||
          aliasMatch;
        if (!match) return false;
      }

      return true;
    });

    if (rateFilterComparison !== 'none' && rateFilterValue !== '') {
      const v = parseFloat(rateFilterValue);
      codes = codes.filter(c => {
        const r = (data.conversion_rates[c] || 1) / data.conversion_rates[selectedBase];
        return rateFilterComparison === 'gt' ? r > v : r < v;
      });
    }

    return codes.sort((a, b) => {
      let A, B;
      switch (sortBy) {
        case 'code':        A=a; B=b; return sortOrder==='asc' ? A.localeCompare(B) : B.localeCompare(A);
        case 'numericCode':
          A=parseInt(currencyMapping[a]?.numericCode||0,10); B=parseInt(currencyMapping[b]?.numericCode||0,10);
          return sortOrder==='asc' ? A-B : B-A;
        case 'currency':   A=currencyMapping[a]?.currency||''; B=currencyMapping[b]?.currency||''; return sortOrder==='asc' ? A.localeCompare(B) : B.localeCompare(A);
        case 'location':   A=currencyMapping[a]?.location||''; B=currencyMapping[b]?.location||''; return sortOrder==='asc' ? A.localeCompare(B) : B.localeCompare(A);
        default:
          A=(data.conversion_rates[a]||1)/data.conversion_rates[selectedBase];
          B=(data.conversion_rates[b]||1)/data.conversion_rates[selectedBase];
          return sortOrder==='asc' ? A-B : B-A;
      }
    });
  }

  function getDisplayCodes() {
    // Priority currencies always shown first regardless of sort
    const prio = ['USD','EUR','GBP','AUD','CAD','AED','ZAR'];
    const all  = getFilteredSortedCodes();
    const top  = prio.filter(c => all.includes(c));
    const rest = all.filter(c => !prio.includes(c));
    return [...top, ...rest];
  }

  // Card data memo
  const cardData = useMemo(() => {
    if (!data.conversion_rates[selectedBase]) return [];
    const baseRate  = data.conversion_rates[selectedBase];
    const numAmount = parseFloat(amount) || 0;
    const numMargin = parseFloat(margin) || 0;
    return getDisplayCodes().map(code => {
      const meta            = currencyMapping[code] || {};
      const convertedRate   = code === selectedBase ? 1 : data.conversion_rates[code] / baseRate;
      const convertedAmount = numAmount * convertedRate;
      const marginRate      = convertedRate * (1 + numMargin / 100);
      const marginAmount    = numAmount * marginRate;
      return { code, name: meta.currency||code, location: meta.location||'', numericCode: meta.numericCode||'', flag: meta.flag||'', countryCode: meta.countryCode||'', convertedRate, convertedAmount, marginRate, marginAmount };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedBase, amount, margin, filterText, searchTerm, rateFilterComparison, rateFilterValue, sortBy, sortOrder]);

  // Export helpers
  const getExportData = () => {
    const headers = ['Currency Code','Currency','Location','Rate','Converted Amount','Margined Rate','Margined Amount'];
    const factor  = 1 + (parseFloat(margin)||0)/100;
    const rows = getDisplayCodes().map(code => {
      const rate = code === selectedBase ? 1 : (data.conversion_rates[code] || 0) / data.conversion_rates[selectedBase];
      const converted = rate*(parseFloat(amount)||0);
      const units     = Number(currencyMapping[code]?.minorUnits??2);
      const decimals  = units===0?0:units===3?3:2;
      return [code, currencyMapping[code]?.currency||'', currencyMapping[code]?.location||'', rate.toFixed(4), converted.toFixed(decimals), (rate*factor).toFixed(4), (converted*factor).toFixed(decimals)];
    });
    return [headers, ...rows];
  };
  const exportToCSV   = dt => { const csv=dt.map(r=>r.join(',')).join('\n'); const b=new Blob([csv],{type:'text/csv'}); const l=document.createElement('a'); l.href=URL.createObjectURL(b); l.download='exchange_rates.csv'; document.body.appendChild(l); l.click(); document.body.removeChild(l); };
  const exportToPDF   = dt => { const doc=new jsPDF(); autoTable(doc,{head:[dt[0]],body:dt.slice(1),styles:{fontSize:8},headStyles:{fillColor:[30,58,95]}}); doc.save('exchange_rates.pdf'); };
  const exportToJSON  = dt => {
    const [headers, ...rows] = dt;
    const json = {
      base: selectedBase,
      amount: parseFloat(amount) || 0,
      margin: parseFloat(margin) || 0,
      timestamp: new Date().toISOString(),
      rates: rows.map(r => Object.fromEntries(headers.map((h, i) => [h.toLowerCase().replace(/ /g,'_'), r[i]])))
    };
    const b = new Blob([JSON.stringify(json, null, 2)], {type:'application/json'});
    const l = document.createElement('a'); l.href = URL.createObjectURL(b); l.download = 'exchange_rates.json'; document.body.appendChild(l); l.click(); document.body.removeChild(l);
  };
  const handleExportSelection = fmt => {
    const dt=getExportData();
    if(fmt==='csv') exportToCSV(dt); else if(fmt==='pdf') exportToPDF(dt); else if(fmt==='json') exportToJSON(dt);
  };

  const codesToDisplay = getDisplayCodes();
  const showMargin     = parseFloat(margin) !== 0;

  const SortArrow = ({ col }) => (
    <span className={sortBy===col ? 'sort-active' : 'sort-neutral'}>
      {sortBy===col ? (sortOrder==='asc'?'▲':'▼') : '⇵'}
    </span>
  );

  return (
    <>
      <Header
        selectedBase={selectedBase}
        sortedBaseCodes={sortedBaseCodes}
        onBaseChange={base => { setSelectedBase(base); localStorage.setItem('fxping_base', base); }}
        amount={amount}
        onAmountChange={handleAmountChange}
        margin={margin}
        onMarginChange={e => {
          let raw = e.target.value;
          if (!/^[0-9]*\.?[0-9]*$/.test(raw)) return;
          const num = parseFloat(raw);
          if (!isNaN(num) && num > 100) raw = '100';
          if (raw.length > 7) return;
          setMargin(raw);
        }}
        updatedDate={data.time_last_update_utc}
      />
      <div className="page-wrap">
      <div className="container">

        {error && <p className="error-msg">Error: {error}</p>}

        {/* Search + view toggle */}
        <div className="search-bar-row">
          <div className="search-box">
            <IconSearch />
            <input type="text" className="search-input" value={searchTerm}
              placeholder="Find a currency"
              onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="view-toggle" ref={exportMenuRef}>
            <div className="export-wrap">
              <button className="btn-export" onClick={() => setExportMenuVisible(v => !v)}>
                <IconDownload /> Export ▾
              </button>
              {exportMenuVisible && (
                <div className="export-menu">
                  <button onMouseDown={e => { e.preventDefault(); handleExportSelection('csv');  setExportMenuVisible(false); }}>CSV</button>
                  <button onMouseDown={e => { e.preventDefault(); handleExportSelection('pdf');  setExportMenuVisible(false); }}>PDF</button>
                  <button onMouseDown={e => { e.preventDefault(); handleExportSelection('json'); setExportMenuVisible(false); }}>JSON</button>
                </div>
              )}
            </div>
            <div className="toggle-divider" />
            <button className={`toggle-btn ${viewMode==='table'?'active':''}`} onClick={() => { setViewMode('table'); localStorage.setItem('fxping_view', 'table'); }}>
              <IconTable /> Table
            </button>
            <button className={`toggle-btn ${viewMode==='cards'?'active':''}`} onClick={() => { setViewMode('cards'); localStorage.setItem('fxping_view', 'cards'); }}>
              <IconCards /> Cards
            </button>
          </div>
        </div>

        <div className="results-count">
          Showing <strong>{viewMode==='cards' ? cardData.length : codesToDisplay.length}</strong> currencies
        </div>

        {/* Content */}
        <div className="content-row">

          <main className="main-content">
            {viewMode === 'table' ? (
              <div className="table-wrapper">
              <div className="table-scroll">
                <table className="fx-table">
                  <thead>
                    <tr>
                      {/* Code column — no inline filter, global search bar handles it */}
                      <th>
                        <span className="th-sortable" onClick={() => handleSortClick('code')}>
                          Code <SortArrow col="code" />
                        </span>
                      </th>

                      <th className="col-hide-mobile"><span className="th-sortable" onClick={() => handleSortClick('numericCode')}>Numeric <SortArrow col="numericCode" /></span></th>
                      <th className="col-hide-mobile"><span className="th-sortable" onClick={() => handleSortClick('currency')}>Currency <SortArrow col="currency" /></span></th>
                      <th className="col-hide-mobile"><span className="th-sortable" onClick={() => handleSortClick('location')}>Location <SortArrow col="location" /></span></th>

                      {/* Rate column with inline filter */}
                      <th style={{position:'relative'}}>
                        {showRateFilter ? (
                          <div ref={rateFilterRef} className="th-rate-filter">
                            <input type="number" value={rateFilterValue} autoFocus className="th-filter-input"
                              onChange={e => setRateFilterValue(e.target.value)}
                              placeholder="Rate" onClick={e => e.stopPropagation()} style={{width:'7ch'}} />
                            <button className="th-cmp-btn" onClick={e => { e.stopPropagation(); setRateFilterComparison(c => c==='gt'?'lt':'gt'); }}>
                              {rateFilterComparison==='gt' ? '>' : '<'}
                            </button>
                          </div>
                        ) : (
                          <div className="th-inner">
                            <span className="th-sortable" onClick={() => handleSortClick('rate')}>
                              {showMargin ? 'Margined Rate' : 'Rate'} <SortArrow col="rate" />
                            </span>
                            <button className="th-filter-btn" onClick={e => { e.stopPropagation(); setShowRateFilter(true); if (rateFilterComparison==='none') setRateFilterComparison('gt'); }}>
                              <IconSearch />
                            </button>
                          </div>
                        )}
                      </th>

                      <th>{showMargin ? 'Margined Amount' : 'Converted Amount'}</th>
                      <th className="col-hide-mobile">Margined Rate</th>
                      <th className="col-hide-mobile">Margined Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codesToDisplay.map(code => {
                      // When code === selectedBase (e.g. USD vs USD), rate is exactly 1
                      const rate = code === selectedBase
                        ? 1
                        : (data.conversion_rates[code] || 0) / data.conversion_rates[selectedBase];
                      const converted      = rate*(parseFloat(amount)||0);
                      const factor         = 1+(parseFloat(margin)||0)/100;
                      const marginedRate   = rate*factor;
                      const marginedAmount = converted*factor;
                      const units          = Number(currencyMapping[code]?.minorUnits??2);
                      const decimals       = units===0?0:units===3?3:2;
                      const flag           = currencyMapping[code]?.flag || '';

                      return (
                        <tr key={code}>
                          <td>
                            <div className="td-code">
                              {currencyMapping[code]?.countryCode && <span className={`fi fi-${currencyMapping[code].countryCode} td-flag`}></span>}
                              <Link to={`/currency/${code}`} state={{ base: selectedBase }} className="td-code-link">{code}</Link>
                            </div>
                          </td>
                          <td className="td-muted col-hide-mobile">{currencyMapping[code]?.numericCode}</td>
                          <td className="col-hide-mobile">{currencyMapping[code]?.currency}</td>
                          <td className="td-location col-hide-mobile">{currencyMapping[code]?.location}</td>
                          <td className="td-number">
                            {showMargin
                              ? marginedRate.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})
                              : rate > 1000
                                ? rate.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})
                                : rate.toFixed(4)}
                          </td>
                          <td className={`td-number${showMargin ? ' td-margin' : ''}`}>
                            {(showMargin ? marginedAmount : converted).toLocaleString(undefined,{minimumFractionDigits:decimals,maximumFractionDigits:decimals})}
                          </td>
                          <td className="td-number col-hide-mobile">
                            {marginedRate.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})}
                          </td>
                          <td className="td-number td-margin col-hide-mobile">
                            {marginedAmount.toLocaleString(undefined,{minimumFractionDigits:decimals,maximumFractionDigits:decimals})}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

                {codesToDisplay.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon"><IconSearch /></div>
                    <p>No currencies found matching "<strong>{searchTerm || filterText}</strong>"</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="cards-grid">
                  {cardData.map(currency => (
                    <RateCard key={currency.code} currency={currency} showMargin={showMargin} margin={margin} selectedBase={selectedBase} />
                  ))}
                </div>
                {cardData.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon"><IconSearch /></div>
                    <p>No currencies found matching "<strong>{searchTerm || filterText}</strong>"</p>
                  </div>
                )}
              </>
            )}
          </main>

        </div>

      </div>
    </div>
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <Routes>
        <Route path="/"        element={<ConversionUI />} />
        <Route path="/about"   element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms"   element={<Terms />} />
        <Route path="/currency/:code" element={<CurrencyDetail key={location.pathname} />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;