// Header.js
import React from 'react';
import logo from './logo.png';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header-container">
      <div className="branding">
        <img src={logo} alt="FX Ping Logo" className="site-logo" />
        <span className="site-tagline">Simple Currency Converter</span>
      </div>

      {/* now its own element */}
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
}
