import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Legal.css';

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

function PrivacyPolicy() {
  const location = useLocation();
  return (
    <div className="legal-page">
      <div className="legal-inner">

        <Link to="/" className="legal-back"><IconArrow /> Back to home</Link>

        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-subtitle">Last updated March 2026</p>

        <nav className="legal-tabs">
          <Link to="/about"   className={`legal-tab ${location.pathname === '/about'   ? 'active' : ''}`}>About</Link>
          <Link to="/privacy" className={`legal-tab ${location.pathname === '/privacy' ? 'active' : ''}`}>Privacy</Link>
          <Link to="/terms"   className={`legal-tab ${location.pathname === '/terms'   ? 'active' : ''}`}>Terms</Link>
        </nav>

        <div className="legal-section">
          <h2>What we collect</h2>
          <p>
            FX Ping does not require an account, login, or any personal information to use.
          </p>
          <p>
            We use <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">Google Analytics</a> to
            collect anonymised usage data — pages visited, session duration, device type, and approximate
            location (country level). This data is used solely to understand how the site is used and to
            improve it. No personally identifiable information is collected or stored.
          </p>
        </div>

        <div className="legal-section">
          <h2>Cookies</h2>
          <p>
            Google Analytics sets cookies to distinguish users and sessions. These are analytics-only
            cookies and do not track you across other websites for advertising purposes.
          </p>
          <p>
            FX Ping also stores your selected base currency and view preference (table/cards) in your
            browser's <code>localStorage</code>. This data never leaves your device.
          </p>
        </div>

        <div className="legal-section">
          <h2>Third-party services</h2>
          <ul>
            <li>
              <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a>{' '}
              — provides live exchange rate data. Your requests are routed through our backend; your IP
              address is not forwarded to ExchangeRate-API.
            </li>
            <li>
              <a href="https://frankfurter.dev" target="_blank" rel="noopener noreferrer">Frankfurter</a>{' '}
              — provides historical rate data. Requests are made directly from your browser to the
              Frankfurter API.
            </li>
            <li>
              <a href="https://flagcdn.com" target="_blank" rel="noopener noreferrer">flagcdn.com</a>{' '}
              — serves country flag images. Requests are made directly from your browser.
            </li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Data sharing</h2>
          <p>
            We do not sell, rent, or share your data with any third parties beyond the analytics and
            API services described above.
          </p>
        </div>

        <div className="legal-section">
          <h2>Changes to this policy</h2>
          <p>
            This policy may be updated from time to time. The date at the top of this page reflects
            the most recent revision.
          </p>
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicy;