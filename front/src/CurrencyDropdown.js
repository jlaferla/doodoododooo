// src/CurrencyDropdown.js — searchable currency picker
import React, { useState, useRef, useEffect, useMemo } from 'react';
import currencyMapping from './currencyMapping.json';
import './CurrencyDropdown.css';

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function CurrencyDropdown({
  value,
  onChange,          // called with code string
  codes,             // array of currency codes to show
  variant = 'header', // 'header' | 'page'
  className = '',
}) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef();
  const searchRef  = useRef();
  const panelRef   = useRef();
  const [panelStyle, setPanelStyle] = useState({});

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        panelRef.current   && !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') { setOpen(false); setSearch(''); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Auto-focus search when opened
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect       = triggerRef.current.getBoundingClientRect();
      const panelWidth = Math.max(rect.width, 280);
      const rightEdge  = rect.left + panelWidth;
      const leftPos    = rightEdge > window.innerWidth - 8
        ? window.innerWidth - panelWidth - 8
        : rect.left;
      setPanelStyle({
        position: 'fixed',
        top:      rect.bottom + 4,
        left:     Math.max(8, leftPos),
        width:    panelWidth,
        zIndex:   999,
      });
    }
    setOpen(v => !v);
    setSearch('');
  };

  const handleSelect = code => {
    onChange(code);
    setOpen(false);
    setSearch('');
  };

  const filtered = useMemo(() => {
    if (!search) return codes;
    const s = search.toLowerCase();
    return codes.filter(c => {
      const meta = currencyMapping[c] || {};
      return (
        c.toLowerCase().includes(s) ||
        (meta.currency || '').toLowerCase().includes(s) ||
        (meta.location || '').toLowerCase().includes(s)
      );
    });
  }, [codes, search]);

  const meta = currencyMapping[value] || {};

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`cdd-trigger cdd-trigger--${variant}${className ? ' ' + className : ''}`}
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {meta.countryCode && (
          <img
            src={`https://flagcdn.com/24x18/${meta.countryCode}.png`}
            srcSet={`https://flagcdn.com/48x36/${meta.countryCode}.png 2x`}
            width="24" height="18" alt=""
            className="cdd-trigger-flag"
          />
        )}
        <span className="cdd-trigger-code">{value || '—'}</span>
        <svg
          className={`cdd-chevron${open ? ' cdd-chevron--open' : ''}`}
          width="10" height="7" viewBox="0 0 10 7" fill="none"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div ref={panelRef} className="cdd-panel" style={panelStyle} role="listbox">
          <div className="cdd-search-wrap">
            <IconSearch />
            <input
              ref={searchRef}
              type="text"
              className="cdd-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search currency…"
            />
            {search && (
              <button className="cdd-search-clear" onClick={() => setSearch('')} type="button">
                ×
              </button>
            )}
          </div>
          <div className="cdd-list">
            {filtered.length === 0 && (
              <div className="cdd-empty">No currencies found</div>
            )}
            {filtered.map(c => {
              const m = currencyMapping[c] || {};
              return (
                <button
                  key={c}
                  type="button"
                  role="option"
                  aria-selected={c === value}
                  className={`cdd-option${c === value ? ' cdd-option--active' : ''}`}
                  onMouseDown={() => handleSelect(c)}
                >
                  {m.countryCode && (
                    <img
                      src={`https://flagcdn.com/20x15/${m.countryCode}.png`}
                      srcSet={`https://flagcdn.com/40x30/${m.countryCode}.png 2x`}
                      width="20" height="15" alt=""
                      className="cdd-opt-flag"
                    />
                  )}
                  <span className="cdd-opt-code">{c}</span>
                  <span className="cdd-opt-name">{m.currency || ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
