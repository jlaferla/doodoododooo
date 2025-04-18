// Header.js
import React from 'react';
import logo from './logo.png';  // Make sure logo.png is in the same folder as Header.js (or adjust the path)
import { Link } from 'react-router-dom';
import './Header.css'; // (or App.css if you prefer)

export default function Header() {
  return (
    <header className="header-container">
      <div className="branding">
      <img src={logo} alt="FX Ping Logo" className="site-logo" />
        <span className="site-tagline">Simple Currency Converter</span>
      </div>
      <nav className="nav-links">
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>      </nav>
    </header>
  );
}
