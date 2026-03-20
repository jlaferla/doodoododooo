// src/Header.js
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import CurrencyDropdown from './CurrencyDropdown';

const IconRefresh = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconBurger = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

function Header({
  selectedBase = '', sortedBaseCodes = [], onBaseChange,
  amount, onAmountChange, onAmountPaste, amountInputRef,
  margin = '', onMarginChange,
  onExport,
  updatedDate,
  darkMode = false, onToggleDark,
  // Simple mode — logo + burger only (legal pages)
  simpleMode = false,
  // Currency detail mode
  currencyDetailMode = false,
  detailCode, detailName, detailCountryCode,
  detailLiveRate, detailChartBase, detailChartBaseCountryCode,
  detailSupported = true,
  detailBaseSupported = true,
  detailBaseOptions = [], onDetailBaseChange,
  detailTargetOptions = [], onDetailTargetChange, onDetailSwap,
  onBack,
}) {
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [panelOpen,  setPanelOpen]  = useState(false);
  const burgerRef = useRef();

  // Build the Charts link: base = user's selected base, target = USD (fallback priority)
  const FALLBACK_ORDER = ['USD','EUR','GBP','AUD','CAD','JPY','CHF'];
  const chartsBase = currencyDetailMode ? detailChartBase : selectedBase;
  const chartsTarget = (() => {
    for (const c of FALLBACK_ORDER) {
      if (c !== chartsBase) return c;
    }
    return 'EUR';
  })();
  const chartsLink = `/currency/${chartsTarget}`;
  const chartsState = { base: chartsBase };

  const formatDate = (str) => {
    if (!str) return '—';
    try {
      const d = new Date(str);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return str; }
  };

  const amountFormatted = (amount || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const summaryText = `${selectedBase} · ${amountFormatted} · ${margin || 0}%`;

  React.useEffect(() => {
    const h = e => {
      if (burgerOpen && burgerRef.current && !burgerRef.current.contains(e.target)) setBurgerOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [burgerOpen]);

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
          {currencyDetailMode || simpleMode ? null : (
            <>
              <div className="nav-divider" />
              <div className="nav-updated">
                <IconRefresh />
                {updatedDate ? `Updated: ${formatDate(updatedDate)}` : 'Loading…'}
              </div>
            </>
          )}
        </div>

        {simpleMode ? null : currencyDetailMode ? (
          <div className="navbar-center">
            <CurrencyDropdown
              value={detailChartBase}
              onChange={c => onDetailBaseChange({ target: { value: c } })}
              codes={detailBaseOptions}
              variant="header"
            />
            <button className="cd-nav-swap" onClick={onDetailSwap} title="Swap currencies">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/><line x1="3" y1="5" x2="21" y2="5"/>
                <polyline points="7 23 3 19 7 15"/><line x1="21" y1="19" x2="3" y2="19"/>
              </svg>
            </button>
            <CurrencyDropdown
              value={detailCode}
              onChange={c => onDetailTargetChange({ target: { value: c } })}
              codes={detailTargetOptions}
              variant="header"
            />
          </div>
        ) : (
          <div className="navbar-center">
            <div className="tb-field">
              <span className="tb-label">Base</span>
              <CurrencyDropdown
                value={selectedBase}
                onChange={onBaseChange}
                codes={sortedBaseCodes}
                variant="header"
              />
            </div>
            <div className="tb-divider" />
            <div className="tb-field">
              <span className="tb-label">Amount</span>
              <input type="text" className="tb-input"
                ref={amountInputRef}
                value={amountFormatted}
                style={{width: `${Math.max(3.5, amountFormatted.length - (amountFormatted.match(/[,.]/g)||[]).length * 0.45 + 0.75)}ch`}}
                onChange={onAmountChange} onPaste={onAmountPaste} placeholder="1" />
            </div>
            <div className="tb-divider" />
            <div className="tb-field">
              <span className="tb-label">Margin %</span>
              <input type="text" className="tb-input tb-input-sm"
                value={margin} placeholder="0"
                style={{width: `${Math.max(2.5, (margin || '0').length + 0.5)}ch`}}
                onChange={onMarginChange} />
            </div>
          </div>
        )}

        <div className="navbar-right">
          <button className="btn-theme" onClick={onToggleDark} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {darkMode ? <IconSun /> : <IconMoon />}
          </button>
          <div className="burger-wrap" ref={burgerRef}>
            <button className="btn-burger" onClick={e => { e.stopPropagation(); setBurgerOpen(v => !v); }}>
              <IconBurger />
            </button>
            {burgerOpen && (
              <div className="burger-menu">
                <Link to="/" className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Currency Converter</Link>
                <Link to="/rates" className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Rates</Link>
                <Link to={chartsLink} state={chartsState} className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Charts</Link>
                <Link to="/fee-checker" className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Fee Checker</Link>
                <Link to="/blog" className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Blog</Link>
              </div>
            )}
          </div>
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
            <div className="navbar-center" style={{gap:'.4rem'}}>
              <div className="cd-nav-base-select-wrap">
                {detailChartBaseCountryCode && detailBaseSupported && <img src={`https://flagcdn.com/24x18/${detailChartBaseCountryCode}.png`} srcSet={`https://flagcdn.com/48x36/${detailChartBaseCountryCode}.png 2x`} width="24" height="18" alt={`${detailChartBase} flag`} className="cd-nav-flag" />}
                <span className="cd-nav-select-label">{detailBaseSupported ? detailChartBase : ''}</span>
                <select className="cd-nav-base-select" value={detailBaseSupported ? detailChartBase : ''} onChange={onDetailBaseChange}>
                  {!detailBaseSupported && <option value="" disabled> </option>}
                  {detailBaseOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button className="cd-nav-swap" onClick={onDetailSwap} title="Swap currencies">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"/><line x1="3" y1="5" x2="21" y2="5"/>
                  <polyline points="7 23 3 19 7 15"/><line x1="21" y1="19" x2="3" y2="19"/>
                </svg>
              </button>
              <div className="cd-nav-base-select-wrap">
                {detailSupported && detailCountryCode && <img src={`https://flagcdn.com/24x18/${detailCountryCode}.png`} srcSet={`https://flagcdn.com/48x36/${detailCountryCode}.png 2x`} width="24" height="18" alt={`${detailCode} flag`} className="cd-nav-flag" />}
                <span className="cd-nav-select-label">{detailSupported ? detailCode : ''}</span>
                <select className="cd-nav-base-select" value={detailSupported ? detailCode : ''} onChange={onDetailTargetChange}>
                  {!detailSupported && <option value="" disabled> </option>}
                  {detailTargetOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          ) : simpleMode ? null : (
            <div className="nav-summary" onClick={() => setPanelOpen(v => !v)}>
              <span className="nav-summary-text">{summaryText}</span>
              <span className={`nav-summary-chevron ${panelOpen ? 'open' : ''}`}>
                <IconChevron />
              </span>
            </div>
          )}

          <button className="btn-theme" onClick={onToggleDark} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {darkMode ? <IconSun /> : <IconMoon />}
          </button>
          <div className="burger-wrap" ref={burgerRef}>
            <button className="btn-burger" onClick={e => { e.stopPropagation(); setBurgerOpen(v => !v); }}>
              <IconBurger />
            </button>
            {burgerOpen && (
              <div className="burger-menu">
                <Link to="/" className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Currency Converter</Link>
                <Link to="/rates" className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Rates</Link>
                <Link to={chartsLink} state={chartsState} className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Charts</Link>
                <Link to="/fee-checker" className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Fee Checker</Link>
                <Link to="/blog" className="burger-item" onClick={e => { e.stopPropagation(); setBurgerOpen(false); }}>Blog</Link>
              </div>
            )}
          </div>


        </div>

        {/* Expandable panel — only on main page */}
        {!currencyDetailMode && (
          <div className={`nav-expand-panel ${panelOpen ? 'open' : ''}`}>
            <div className="nav-expand-inner">
              <div className="nav-field-mobile">
                <label className="nav-field-label">Base</label>
                <CurrencyDropdown
                  value={selectedBase}
                  onChange={onBaseChange}
                  codes={sortedBaseCodes}
                  variant="header"
                  className="cdd-nav-field"
                />
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