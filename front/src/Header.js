import React from 'react';
import logo from './logo.png';  // Make sure logo.png is in the same folder as Header.js (or adjust the path)
import './Header.css';

const Header = () => {
  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo-container">
          <img src={logo} alt="FX Ping Logo" className="site-logo" />
        </div>
        <div className="title-container">
          <p className="site-tagline">Simple Currency Converter</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
