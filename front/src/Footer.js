// src/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <Link to="/privacy">Privacy Policy</Link>
        <span className="divider">|</span>
        <Link to="/terms">Terms &amp; Conditions</Link>
      </div>
      <div className="footer-credit">
        &copy; {new Date().getFullYear()} FX Ping
      </div>
    </footer>
  );
}
