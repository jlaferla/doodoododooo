import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* Logo — matches navbar exactly */}
        <Link to="/" className="footer-logo">
          <span className="footer-logo-fx">FX</span>
          <span className="footer-logo-dot" />
          <span className="footer-logo-ping">Ping</span>
        </Link>

        {/* Data sources */}
        <span className="footer-sources">
          Live rates:{' '}
          <a href="https://www.exchangerate-api.com/product/our-exchange-rate-data" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a>
          {' · '}
          Historical charts:{' '}
          <a href="https://frankfurter.dev" target="_blank" rel="noopener noreferrer">Frankfurter</a>
          {' '}(ECB reference rates)
        </span>

        {/* Legal nav */}
        <nav className="footer-legal">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>

        {/* Copyright */}
        <span className="footer-copy">© {new Date().getFullYear()} FXPing</span>

      </div>
    </footer>
  );
}

export default Footer;