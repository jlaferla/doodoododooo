// src/Header.js
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const IconRefresh = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function Header({
  selectedBase, sortedBaseCodes, onBaseChange,
  amount, onAmountChange,
  margin, onMarginChange,
  onExport,
  updatedDate,
  // Currency detail mode
  currencyDetailMode = false,
  detailCode, detailName, detailCountryCode,
  detailLiveRate, detailChartBase,
  onBack,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const [panelOpen,  setPanelOpen]  = useState(false);
  const exportRef = useRef();

  const formatDate = (str) => {
    if (!str) return '—';
    try {
      const d = new Date(str);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return str; }
  };

  const amountFormatted = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const summaryText = `${selectedBase} · ${amountFormatted} · ${margin || 0}%`;

  React.useEffect(() => {
    const h = e => {
      if (exportOpen && exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [exportOpen]);

  return (
    <nav className="navbar">

      {/* ── DESKTOP ── */}
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="nav-logo">
            <span className="logo-fx">FX</span>
            <span className="logo-dot" />
            <span className="logo-ping">Ping</span>
          </Link>
          {!currencyDetailMode && (
            <>
              <div className="nav-divider" />
              <div className="nav-updated">
                <IconRefresh />
                {updatedDate ? `Updated: ${formatDate(updatedDate)}` : 'Loading…'}
              </div>
            </>
          )}
        </div>

        {currencyDetailMode ? (
          <div className="navbar-center" />
        ) : (
          <div className="navbar-center">
            <div className="tb-field">
              <span className="tb-label">Base</span>
              <select className="tb-select" value={selectedBase} onChange={e => onBaseChange(e.target.value)}>
                {sortedBaseCodes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="tb-divider" />
            <div className="tb-field">
              <span className="tb-label">Amount</span>
              <input type="text" className="tb-input"
                value={amountFormatted}
                onChange={onAmountChange} placeholder="1" />
            </div>
            <div className="tb-divider" />
            <div className="tb-field">
              <span className="tb-label">Margin %</span>
              <input type="text" className="tb-input tb-input-sm"
                value={margin} placeholder="0" maxLength={7}
                onChange={onMarginChange} />
            </div>
          </div>
        )}

        <div className="navbar-right">
          {currencyDetailMode ? (
            <button className="cd-nav-back" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to rates
            </button>
          ) : (
            <div className="export-wrap" ref={exportRef}>
              <button className="btn-export" onClick={() => setExportOpen(v => !v)}>
                <IconDownload /> Export
              </button>
              {exportOpen && (
                <div className="export-menu">
                  <button onMouseDown={e => { e.preventDefault(); onExport('csv');  setExportOpen(false); }}>CSV</button>
                  <button onMouseDown={e => { e.preventDefault(); onExport('pdf');  setExportOpen(false); }}>PDF</button>
                  <button onMouseDown={e => { e.preventDefault(); onExport('json'); setExportOpen(false); }}>JSON</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="mobile-navbar">
        <div className="mobile-nav-bar">
          <Link to="/" className="nav-logo">
            <span className="logo-fx">FX</span>
            <span className="logo-dot" />
            <span className="logo-ping">Ping</span>
          </Link>

          {currencyDetailMode ? (
            <div className="cd-mob-identity">
              <span style={{fontSize:'.82rem',color:'rgba(255,255,255,.5)'}}>← </span>
              <button className="cd-nav-back-plain" onClick={onBack}>Back to rates</button>
            </div>
          ) : (
            <div className="nav-summary" onClick={() => setPanelOpen(v => !v)}>
              <span className="nav-summary-text">{summaryText}</span>
              <span className={`nav-summary-chevron ${panelOpen ? 'open' : ''}`}>
                <IconChevron />
              </span>
            </div>
          )}

          {!currencyDetailMode && (
            <div className="export-wrap" ref={exportRef}>
              <button className="mobile-export-btn" onClick={() => setExportOpen(v => !v)}>
                <IconDownload /> Export
              </button>
              {exportOpen && (
                <div className="export-menu export-menu-left">
                  <button onMouseDown={e => { e.preventDefault(); onExport('csv');  setExportOpen(false); }}>CSV</button>
                  <button onMouseDown={e => { e.preventDefault(); onExport('pdf');  setExportOpen(false); }}>PDF</button>
                  <button onMouseDown={e => { e.preventDefault(); onExport('json'); setExportOpen(false); }}>JSON</button>
                </div>
              )}
            </div>
          )}


        </div>

        {/* Expandable panel — only on main page */}
        {!currencyDetailMode && (
          <div className={`nav-expand-panel ${panelOpen ? 'open' : ''}`}>
            <div className="nav-expand-inner">
              <div className="nav-field-mobile">
                <label className="nav-field-label">Base</label>
                <select className="nav-field-input nav-field-select"
                  value={selectedBase} onChange={e => onBaseChange(e.target.value)}>
                  {sortedBaseCodes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="nav-field-mobile">
                <label className="nav-field-label">Amount</label>
                <input type="text" className="nav-field-input"
                  value={amountFormatted}
                  onChange={onAmountChange} placeholder="1" />
              </div>
              <div className="nav-field-mobile">
                <label className="nav-field-label">Margin %</label>
                <input type="text" className="nav-field-input"
                  value={margin} placeholder="0" maxLength={7}
                  onChange={onMarginChange} />
              </div>
            </div>
          </div>
        )}
      </div>

    </nav>
  );
}

export default Header;