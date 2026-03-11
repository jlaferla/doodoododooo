import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Legal.css';

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

function About() {
  const location = useLocation();
  return (
    <div className="legal-page">
      <div className="legal-inner">

        <Link to="/" className="legal-back"><IconArrow /> Back to rates</Link>

        <h1 className="legal-title">About FX Ping</h1>
        <p className="legal-subtitle">Last updated March 2026</p>

        <nav className="legal-tabs">
          <Link to="/about"   className={`legal-tab ${location.pathname === '/about'   ? 'active' : ''}`}>About</Link>
          <Link to="/privacy" className={`legal-tab ${location.pathname === '/privacy' ? 'active' : ''}`}>Privacy</Link>
          <Link to="/terms"   className={`legal-tab ${location.pathname === '/terms'   ? 'active' : ''}`}>Terms</Link>
        </nav>

        <div className="legal-section">
          <h2>What is FX Ping?</h2>
          <p>
            FX Ping is a free currency converter and FX margin calculator. It lets you check live
            exchange rates across 150+ currencies, apply a custom margin to see the real cost of
            a conversion, and view historical rate charts going back years.
          </p>
          <p>
            It was built as a clean, fast alternative to the bloated converter tools that dominate
            search results — no ads, no sign-up, no noise.
          </p>
        </div>

        <div className="legal-section">
          <h2>Data sources</h2>
          <p>
            Live exchange rates are provided by{' '}
            <a href="https://www.exchangerate-api.com/product/our-exchange-rate-data" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a>,
            which blends data from 30+ central banks and commercial forex marketplaces into a single
            indicative mid-market rate, updated daily on the free plan.
          </p>
          <p>
            Historical rate charts use{' '}
            <a href="https://frankfurter.dev" target="_blank" rel="noopener noreferrer">Frankfurter</a>,
            an open-source API that tracks the official reference rates published by the{' '}
            <a href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html" target="_blank" rel="noopener noreferrer">European Central Bank</a>{' '}
            each business day at ~16:00 CET. ECB rates cover ~32 major currencies.
          </p>
        </div>

      </div>
    </div>
  );
}

export default About;