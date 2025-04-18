import React from 'react';

export default function About() {
  return (
    <div>
      <h2>About FX Ping</h2>
      <p>
        FX Ping was founded to make currency conversion effortless and transparent. 
        Our mission is to provide up‑to‑date exchange rates pulled from multiple 
        sources, cached for performance, and presented in a clean, intuitive interface.
      </p>
      <ul>
        <li><strong>Real‑Time Data:</strong> Rates updated on a schedule so you’re never out of sync.</li>
        <li><strong>Export Options:</strong> Download conversions in CSV, Excel, or PDF.</li>
        <li><strong>Open‑Source Core:</strong> Built with React, Flask, and community‑driven data sources.</li>
      </ul>
      <p>
        We’re constantly adding new features—stay tuned for mobile apps, historical charts, 
        and API access for developers!
      </p>
    </div>
  );
}
