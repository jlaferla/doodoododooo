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

function Header({
  selectedBase, sortedBaseCodes, onBaseChange,
  amount, onAmountChange,
  margin, onMarginChange,
  onExport,
  updatedDate,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef();

  // Format date as "06 Mar 2026" from the full UTC string
  const formatDate = (str) => {
    if (!str) return '—';
    try {
      const d = new Date(str);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return str; }
  };

  // Click outside to close export menu
  React.useEffect(() => {
    const h = e => { if (exportOpen && exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [exportOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Left: logo + updated */}
        <div className="navbar-left">
          <Link to="/" className="nav-logo">
            <span className="logo-fx">FX</span>
            <span className="logo-dot" />
            <span className="logo-ping">Ping</span>
          </Link>
          <div className="nav-divider" />
          <div className="nav-updated">
            <IconRefresh />
            {updatedDate ? `Updated: ${formatDate(updatedDate)}` : 'Loading…'}
          </div>
        </div>

        {/* Centre: inputs */}
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
              value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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

        {/* Right: export */}
        <div className="navbar-right">
          <div className="export-wrap" ref={exportRef}>
            <button className="btn-export" onClick={() => setExportOpen(v => !v)}>
              <IconDownload /> Export
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button onClick={() => { onExport('csv');  setExportOpen(false); }}>CSV</button>
                <button onClick={() => { onExport('xlsx'); setExportOpen(false); }}>Excel</button>
                <button onClick={() => { onExport('pdf');  setExportOpen(false); }}>PDF</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Header;