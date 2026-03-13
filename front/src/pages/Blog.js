// src/pages/Blog.js
import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../blogPosts';
import './Blog.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

export default function Blog() {
  return (
    <div className="blog-index-page">
      <div className="blog-index-hero">
        <div className="blog-index-hero-inner">
          <div className="blog-series-pill">FX Explained</div>
          <h1 className="blog-index-title">FX for beginners</h1>
          <p className="blog-index-subtitle">
            Plain-English guides to understanding foreign exchange —
            no jargon, no sales pitch, just clear explanations of how it actually works.
          </p>
        </div>
      </div>

      <div className="blog-index-body">
        <div className="blog-grid">
          {blogPosts.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className={`blog-card ${i === 0 ? 'blog-card-featured' : ''}`}
            >
              <div className="blog-card-illustration">
                <BlogIllustration type={post.illustration} featured={i === 0} />
              </div>
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span className="blog-card-num">#{post.number}</span>
                  <span className="blog-card-dot">·</span>
                  <span className="blog-card-date">{formatDate(post.date)}</span>
                  <span className="blog-card-dot">·</span>
                  <span className="blog-card-read">{post.readTime}</span>
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <span className="blog-card-cta">Read article →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline SVG illustrations — one per post type
function BlogIllustration({ type, featured }) {
  const h = featured ? 200 : 140;
  const w = '100%';

  const illustrations = {
    strength: (
      <svg viewBox="0 0 400 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="str-g1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        {/* Two wallets: thin vs thick */}
        {/* Weak wallet - thin */}
        <rect x="40" y="55" width="28" height="50" rx="5" fill="none" stroke="#94a3b8" strokeWidth="2"/>
        <rect x="40" y="55" width="28" height="18" rx="3" fill="#94a3b8" opacity="0.2"/>
        <text x="54" y="114" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Inter,sans-serif">weak</text>
        <text x="54" y="126" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">buys less</text>

        {/* Strong wallet - thick */}
        <rect x="108" y="40" width="48" height="70" rx="6" fill="none" stroke="#2563eb" strokeWidth="2.5"/>
        <rect x="108" y="40" width="48" height="28" rx="4" fill="#2563eb" opacity="0.15"/>
        <rect x="116" y="54" width="32" height="3" rx="1.5" fill="#2563eb" opacity="0.4"/>
        <rect x="116" y="61" width="32" height="3" rx="1.5" fill="#2563eb" opacity="0.3"/>
        <rect x="116" y="68" width="22" height="3" rx="1.5" fill="#2563eb" opacity="0.2"/>
        <text x="132" y="124" textAnchor="middle" fontSize="10" fill="#2563eb" fontFamily="Inter,sans-serif">strong</text>
        <text x="132" y="136" textAnchor="middle" fontSize="9" fill="#2563eb" fontFamily="Inter,sans-serif">buys more</text>

        {/* Arrow */}
        <line x1="76" y1="80" x2="100" y2="80" stroke="#e2e8f0" strokeWidth="1.5" markerEnd="url(#arr)"/>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#e2e8f0"/>
          </marker>
        </defs>

        {/* Rate example */}
        <rect x="220" y="35" width="150" height="90" rx="10" fill="url(#str-g1)" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.3"/>
        <text x="295" y="58" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="Inter,sans-serif">1 GBP buys</text>
        <text x="295" y="82" textAnchor="middle" fontSize="26" fontWeight="700" fill="#2563eb" fontFamily="Inter,sans-serif">$1.30</text>
        <text x="295" y="100" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Inter,sans-serif">vs $1.20 last month</text>
        <text x="295" y="116" textAnchor="middle" fontSize="10" fill="#16a34a" fontFamily="Inter,sans-serif">↑ pound got stronger</text>
      </svg>
    ),

    waves: (
      <svg viewBox="0 0 400 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wave-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Supply/demand wave chart */}
        <path d="M30,110 C60,90 80,120 110,95 C140,70 160,105 190,85 C220,65 240,100 270,78 C300,56 320,90 350,68 C365,60 375,55 390,50"
          fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M30,110 C60,90 80,120 110,95 C140,70 160,105 190,85 C220,65 240,100 270,78 C300,56 320,90 350,68 C365,60 375,55 390,50 L390,140 L30,140 Z"
          fill="url(#wave-g)"/>
        {/* Labels */}
        <text x="30" y="18" fontSize="11" fill="#475569" fontFamily="Inter,sans-serif">More buyers → rate rises</text>
        <text x="30" y="34" fontSize="11" fill="#94a3b8" fontFamily="Inter,sans-serif">More sellers → rate falls</text>
        {/* Dots at key points */}
        <circle cx="190" cy="85" r="4" fill="#2563eb"/>
        <circle cx="270" cy="78" r="4" fill="#2563eb"/>
        <circle cx="350" cy="68" r="4" fill="#2563eb"/>
        {/* Y axis */}
        <line x1="25" y1="45" x2="25" y2="130" stroke="#e2e8f0" strokeWidth="1"/>
        <line x1="20" y1="130" x2="395" y2="130" stroke="#e2e8f0" strokeWidth="1"/>
        <text x="15" y="133" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">rate</text>
        <text x="370" y="143" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">time</text>
      </svg>
    ),

    storm: (
      <svg viewBox="0 0 400 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="storm-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Calm line then shock */}
        <path d="M30,90 C50,88 70,92 90,89 C110,86 130,91 150,88"
          fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,3"/>
        {/* Shock drop */}
        <path d="M150,88 L185,135 L200,75 L215,120 L240,70"
          fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round"/>
        {/* Recovery */}
        <path d="M240,70 C260,65 280,72 300,68 C320,64 340,70 370,66"
          fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round"/>
        {/* Area under shock */}
        <path d="M150,88 L185,135 L200,75 L215,120 L240,70 L240,140 L150,140 Z"
          fill="url(#storm-g)"/>
        {/* Event marker */}
        <line x1="150" y1="30" x2="150" y2="140" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.5"/>
        <rect x="100" y="16" width="100" height="22" rx="4" fill="#dc2626" opacity="0.1"/>
        <text x="150" y="31" textAnchor="middle" fontSize="10" fill="#dc2626" fontFamily="Inter,sans-serif" fontWeight="600">rate shock event</text>
        <text x="30" y="150" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">calm</text>
        <text x="158" y="150" fontSize="9" fill="#dc2626" fontFamily="Inter,sans-serif">volatile</text>
        <text x="270" y="150" fontSize="9" fill="#2563eb" fontFamily="Inter,sans-serif">recovery</text>
      </svg>
    ),

    midpoint: (
      <svg viewBox="0 0 400 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        {/* Buy side */}
        <rect x="30" y="55" width="140" height="50" rx="6" fill="#16a34a" fillOpacity="0.15" stroke="#16a34a" strokeWidth="1.5"/>
        <text x="100" y="75" textAnchor="middle" fontSize="10" fill="#16a34a" fontFamily="Inter,sans-serif">BANK BUYS</text>
        <text x="100" y="92" textAnchor="middle" fontSize="16" fontWeight="700" fill="#16a34a" fontFamily="JetBrains Mono,monospace">1.0620</text>
        {/* Sell side */}
        <rect x="230" y="55" width="140" height="50" rx="6" fill="#dc2626" fillOpacity="0.15" stroke="#dc2626" strokeWidth="1.5"/>
        <text x="300" y="75" textAnchor="middle" fontSize="10" fill="#dc2626" fontFamily="Inter,sans-serif">BANK SELLS</text>
        <text x="300" y="92" textAnchor="middle" fontSize="16" fontWeight="700" fill="#dc2626" fontFamily="JetBrains Mono,monospace">1.1080</text>
        {/* Mid marker */}
        <line x1="200" y1="45" x2="200" y2="115" stroke="#2563eb" strokeWidth="2" strokeDasharray="4,3"/>
        <circle cx="200" cy="80" r="16" fill="#2563eb" fillOpacity="0.15" stroke="#2563eb" strokeWidth="2"/>
        <text x="200" y="77" textAnchor="middle" fontSize="8" fill="#2563eb" fontFamily="Inter,sans-serif" fontWeight="600">MID</text>
        <text x="200" y="87" textAnchor="middle" fontSize="8" fill="#2563eb" fontFamily="Inter,sans-serif" fontWeight="600">MARKET</text>
        <text x="200" y="125" textAnchor="middle" fontSize="11" fill="#2563eb" fontFamily="JetBrains Mono,monospace" fontWeight="700">1.0850</text>
        <text x="200" y="140" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">what Google shows</text>
        {/* Spread labels */}
        <text x="165" y="35" textAnchor="middle" fontSize="9" fill="#16a34a" fontFamily="Inter,sans-serif">← you receive less</text>
        <text x="248" y="35" textAnchor="middle" fontSize="9" fill="#dc2626" fontFamily="Inter,sans-serif">you pay more →</text>
      </svg>
    ),

    margin: (
      <svg viewBox="0 0 400 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        {/* Bar chart: different providers' margins */}
        {[
          { label: 'Airport FX', pct: 82, color: '#dc2626' },
          { label: 'High St Bank', pct: 60, color: '#f97316' },
          { label: 'Online Bank', pct: 35, color: '#eab308' },
          { label: 'Wise / OFX', pct: 10, color: '#16a34a' },
          { label: 'FX Broker', pct: 5, color: '#2563eb' },
        ].map((d, i) => {
          const x = 35 + i * 72;
          const barH = d.pct * 0.9;
          const y = 130 - barH;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width="44" height={barH} rx="4" fill={d.color} opacity="0.85"/>
              <text x={x + 22} y={y - 5} textAnchor="middle" fontSize="9" fill={d.color} fontFamily="JetBrains Mono,monospace">{d.pct < 10 ? `~${d.pct/10*1}%` : d.pct === 10 ? '~1%' : d.pct === 35 ? '~2.5%' : d.pct === 60 ? '~4%' : '~7%'}</text>
              <text x={x + 22} y="148" textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="Inter,sans-serif">{d.label.split(' ').map((w,j) => (
                <tspan key={j} x={x + 22} dy={j === 0 ? 0 : 10}>{w}</tspan>
              ))}</text>
            </g>
          );
        })}
        <line x1="25" y1="130" x2="390" y2="130" stroke="#e2e8f0" strokeWidth="1"/>
        <text x="25" y="20" fontSize="11" fill="#475569" fontFamily="Inter,sans-serif" fontWeight="600">Typical FX margin by provider</text>
      </svg>
    ),

    weekend: (
      <svg viewBox="0 0 400 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wk-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Week timeline with Sat/Sun greyed */}
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
          const x = 25 + i * 52;
          const isWeekend = i >= 5;
          return (
            <g key={d}>
              <rect x={x} y="30" width="44" height="90" rx="5"
                fill={isWeekend ? '#94a3b8' : '#2563eb'}
                fillOpacity="0.12"
                stroke={isWeekend ? '#94a3b8' : '#2563eb'}
                strokeOpacity={isWeekend ? "0.3" : "0.4"}
                strokeWidth="1"/>
              <text x={x + 22} y="50" textAnchor="middle" fontSize="11"
                fill={isWeekend ? '#94a3b8' : '#2563eb'}
                fontFamily="Inter,sans-serif" fontWeight={isWeekend ? '400' : '600'}>{d}</text>
              {!isWeekend && (
                <>
                  <circle cx={x + 22} cy="85" r="8" fill="#2563eb" opacity="0.15"/>
                  <text x={x + 22} y="89" textAnchor="middle" fontSize="9" fill="#2563eb" fontFamily="Inter,sans-serif">live</text>
                </>
              )}
              {isWeekend && (
                <>
                  <text x={x + 22} y="82" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">frozen</text>
                  <text x={x + 22} y="95" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">rate</text>
                </>
              )}
            </g>
          );
        })}
        <text x="200" y="140" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Inter,sans-serif">Markets close Friday evening · Reopen Sunday night</text>
      </svg>
    ),

    peg: (
      <svg viewBox="0 0 400 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="peg-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Flat pegged line then break */}
        <line x1="30" y1="30" x2="390" y2="30" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,4" opacity="0.4"/>
        <text x="35" y="26" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">peg ceiling: 1.20</text>

        {/* Stable pegged rate */}
        <path d="M30,75 C50,76 70,74 90,75 C110,76 130,74 150,75 C170,76 185,75 200,75"
          fill="none" stroke="#2563eb" strokeWidth="2.5"/>
        <text x="50" y="95" fontSize="10" fill="#2563eb" fontFamily="Inter,sans-serif">pegged rate</text>

        {/* Break line */}
        <line x1="200" y1="20" x2="200" y2="145" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6"/>
        <text x="204" y="30" fontSize="9" fill="#dc2626" fontFamily="Inter,sans-serif" fontWeight="600">peg breaks</text>

        {/* Post-break surge */}
        <path d="M200,75 L210,32 L225,55 L240,38 L270,42 C300,44 330,43 370,43"
          fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M200,75 L210,32 L225,55 L240,38 L270,42 C300,44 330,43 370,43 L370,140 L200,140 Z"
          fill="url(#peg-g)"/>
        <text x="290" y="60" fontSize="10" fill="#dc2626" fontFamily="Inter,sans-serif">+20% in minutes</text>
        {/* Y axis */}
        <line x1="25" y1="20" x2="25" y2="140" stroke="#e2e8f0" strokeWidth="1"/>
        <line x1="25" y1="140" x2="390" y2="140" stroke="#e2e8f0" strokeWidth="1"/>
      </svg>
    ),

    table: (
      <svg viewBox="0 0 400 160" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        {/* Stylised FX table */}
        <rect x="20" y="20" width="360" height="130" rx="8" fill="transparent" stroke="#e2e8f0" strokeOpacity="0.5" strokeWidth="1"/>
        {/* Header row */}
        <rect x="20" y="20" width="360" height="28" rx="8" fill="#2563eb" fillOpacity="0.85"/>
        <text x="40" y="39" fontSize="10" fill="#ffffff" fontFamily="Inter,sans-serif" fontWeight="600">CURRENCY</text>
        <text x="190" y="39" fontSize="10" fill="#ffffff" fontFamily="Inter,sans-serif" fontWeight="600">RATE</text>
        <text x="300" y="39" fontSize="10" fill="#ffffff" fontFamily="Inter,sans-serif" fontWeight="600">CONVERTED</text>
        {/* Rows */}
        {[
          { code: 'EUR', flag: '🇪🇺', rate: '0.9231', conv: '923.10' },
          { code: 'GBP', flag: '🇬🇧', rate: '0.7854', conv: '785.40' },
          { code: 'JPY', flag: '🇯🇵', rate: '149.82', conv: '149,820' },
          { code: 'AED', flag: '🇦🇪', rate: '3.6725', conv: '3,672.50' },
        ].map((row, i) => (
          <g key={row.code}>
            <rect x="20" y={50 + i * 24} width="360" height="24"
              fill="#2563eb" fillOpacity={i % 2 === 0 ? "0" : "0.05"} stroke="none"/>
            <text x="40" y={66 + i * 24} fontSize="10" fill="#64748b" fontFamily="Inter,sans-serif">{row.flag} {row.code}</text>
            <text x="190" y={66 + i * 24} fontSize="10" fill="#3b82f6" fontFamily="JetBrains Mono,monospace" fontWeight="500">{row.rate}</text>
            <text x="300" y={66 + i * 24} fontSize="10" fill="#2563eb" fontFamily="JetBrains Mono,monospace">{row.conv}</text>
          </g>
        ))}
        {/* Divider lines */}
        {[50,74,98,122].map(y => (
          <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="#e2e8f0" strokeWidth="0.5"/>
        ))}
        <text x="200" y="158" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter,sans-serif">Base: 1 USD · Mid-market rate</text>
      </svg>
    ),
  };

  return illustrations[type] || illustrations.table;
}