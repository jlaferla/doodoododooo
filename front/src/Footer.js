import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand">
          <span className="footer-fx">FX</span>Ping
          <span className="footer-tagline"> — Live exchange rates</span>
        </span>
        <span className="footer-copy">© {new Date().getFullYear()} FXPing</span>
      </div>
    </footer>
  );
}

export default Footer;