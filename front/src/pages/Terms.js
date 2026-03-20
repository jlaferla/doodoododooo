import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Legal.css';

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

function Terms() {
  const location = useLocation();
  return (
    <div className="legal-page">
      <div className="legal-inner">

        <Link to="/" className="legal-back"><IconArrow /> Back to home</Link>

        <h1 className="legal-title">Terms of Use</h1>
        <p className="legal-subtitle">Last updated March 2026</p>

        <nav className="legal-tabs">
          <Link to="/about"   className={`legal-tab ${location.pathname === '/about'   ? 'active' : ''}`}>About</Link>
          <Link to="/privacy" className={`legal-tab ${location.pathname === '/privacy' ? 'active' : ''}`}>Privacy</Link>
          <Link to="/terms"   className={`legal-tab ${location.pathname === '/terms'   ? 'active' : ''}`}>Terms</Link>
        </nav>

        <div className="legal-section">
          <h2>Indicative rates only</h2>
          <p>
            All exchange rates displayed on FX Ping are indicative mid-market rates for reference
            purposes only. They are not transaction rates and should not be used as the basis for
            any financial transaction, settlement, or trade.
          </p>
          <p>
            For actual transaction rates, always consult your bank, payment provider, or the
            financial institution handling your conversion.
          </p>
        </div>

        <div className="legal-section">
          <h2>No financial advice</h2>
          <p>
            Nothing on FX Ping constitutes financial, investment, or legal advice. The margin
            calculator is a tool to illustrate the effect of a percentage spread — it does not
            represent any specific product or provider's pricing.
          </p>
        </div>

        <div className="legal-section">
          <h2>Accuracy</h2>
          <p>
            We make reasonable efforts to display accurate and up-to-date exchange rates, but we
            cannot guarantee the accuracy, completeness, or timeliness of the data. Rates are
            sourced from third-party APIs and may differ from rates available in the market at
            any given moment.
          </p>
        </div>

        <div className="legal-section">
          <h2>Availability</h2>
          <p>
            FX Ping is provided free of charge on an "as is" basis. We make no guarantees of
            uptime or availability and reserve the right to modify or discontinue the service
            at any time without notice.
          </p>
        </div>

        <div className="legal-section">
          <h2>Acceptable use</h2>
          <p>
            You may use FX Ping for personal, non-commercial reference purposes. You may not
            scrape, systematically download, or redistribute the data displayed on this site
            without permission.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Terms;