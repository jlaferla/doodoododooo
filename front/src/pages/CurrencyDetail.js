// src/pages/CurrencyDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import currencyMapping from '../currencyMapping.json';
import Header from '../Header';
import './CurrencyDetail.css';

const FRANKFURTER_BASE = 'https://api.frankfurter.dev/v1';

// Frankfurter only covers ~35 ECB currencies
const FRANKFURTER_SUPPORTED = new Set([
  'AUD','BGN','BRL','CAD','CHF','CNY','CZK','DKK','EUR','GBP',
  'HKD','HUF','IDR','ILS','INR','ISK','JPY','KRW','MXN','MYR',
  'NOK','NZD','PHP','PLN','RON','SEK','SGD','THB','TRY','USD','ZAR'
]);

const PERIODS = [
  { label: '7D',  days: 7   },
  { label: '1M',  days: 30  },
  { label: '3M',  days: 90  },
  { label: '6M',  days: 180 },
  { label: '1Y',  days: 365 },
];

function getDateString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function Sparkline({ data, width = 600, height = 200 }) {
  const [hover, setHover] = React.useState(null);
  if (!data || data.length < 2) return null;

  const values = data.map(d => d.rate);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const dataRange = dataMax - dataMin || 1;

  const yPad = dataRange * 0.05;
  const yMin = dataMin - yPad;
  const yMax = dataMax + yPad;
  const yRange = yMax - yMin;

  // Full width for chart, small right margin for y-axis labels
  const pad = { top: 12, right: 58, bottom: 32, left: 12 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * w,
    y: pad.top + h - ((d.rate - yMin) / yRange) * h,
    date: d.date,
    rate: d.rate,
  }));

  // Y-axis ticks — 4 evenly spaced, labels on the RIGHT
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const val = yMin + (yRange / 3) * i;
    return { val, y: pad.top + h - ((val - yMin) / yRange) * h };
  });

  // X-axis month labels
  const monthLabels = [];
  let lastMonth = null;
  data.forEach((d, i) => {
    const month = d.date.slice(0, 7);
    if (month !== lastMonth) {
      const label = new Date(d.date).toLocaleString('default', { month: 'short' });
      monthLabels.push({ label, x: pad.left + (i / (data.length - 1)) * w });
      lastMonth = month;
    }
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const fillD = `${pathD} L${points[points.length-1].x.toFixed(2)},${(pad.top+h).toFixed(2)} L${points[0].x.toFixed(2)},${(pad.top+h).toFixed(2)} Z`;

  const first = values[0];
  const last  = values[values.length - 1];
  const up    = last >= first;
  const color = up ? '#16a34a' : '#dc2626';

  // Find nearest point to mouse x position
  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    let nearest = points[0];
    let minDist = Infinity;
    points.forEach(p => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) { minDist = dist; nearest = p; }
    });
    setHover(nearest);
  };

  // Tooltip position — flip to left side when near right edge
  const tooltipOnRight = hover && hover.x < width * 0.7;
  const tooltipX = hover ? (tooltipOnRight ? hover.x + 10 : hover.x - 10) : 0;
  const tooltipAnchor = tooltipOnRight ? 'start' : 'end';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{width:'100%', height:'100%', cursor:'crosshair'}}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Y-axis gridlines + labels on right */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} y1={t.y} x2={pad.left + w} y2={t.y}
            stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3"/>
          <text x={pad.left + w + 8} y={t.y + 4}
            textAnchor="start" fontSize="10" fill="#0f172a"
            fontFamily="JetBrains Mono, monospace">
            {t.val.toFixed(4)}
          </text>
        </g>
      ))}

      {/* X-axis month labels */}
      {monthLabels.map((m, i) => (
        <text key={i} x={m.x} y={pad.top + h + 22}
          textAnchor="middle" fontSize="10" fill="#0f172a"
          fontFamily="Inter, sans-serif">
          {m.label}
        </text>
      ))}

      <path d={fillD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>

      {/* First and last dots */}
      <circle cx={points[0].x} cy={points[0].y} r="3" fill={color} opacity="0.5"/>
      <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="4" fill={color}/>

      {/* Hover crosshair + tooltip */}
      {hover && (
        <>
          {/* Vertical line */}
          <line
            x1={hover.x} y1={pad.top}
            x2={hover.x} y2={pad.top + h}
            stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
          />
          {/* Dot on line */}
          <circle cx={hover.x} cy={hover.y} r="5" fill={color} stroke="#fff" strokeWidth="2"/>

          {/* Tooltip background */}
          <rect
            x={tooltipOnRight ? tooltipX : tooltipX - 140}
            y={Math.max(pad.top, hover.y - 44)}
            width="138" height="46"
            rx="7" ry="7"
            fill="#1e3a5f" stroke={color} strokeWidth="1.5" opacity="0.96"
          />
          {/* Date */}
          <text
            x={tooltipOnRight ? tooltipX + 12 : tooltipX - 12}
            y={Math.max(pad.top, hover.y - 44) + 17}
            textAnchor={tooltipAnchor}
            fill="rgba(255,255,255,0.65)"
            fontSize="11"
            fontFamily="JetBrains Mono, monospace"
          >{hover.date}</text>
          {/* Rate */}
          <text
            x={tooltipOnRight ? tooltipX + 12 : tooltipX - 12}
            y={Math.max(pad.top, hover.y - 44) + 34}
            textAnchor={tooltipAnchor}
            fill="#fff"
            fontSize="15"
            fontWeight="600"
            fontFamily="JetBrains Mono, monospace"
          >{hover.rate.toFixed(4)}</text>
        </>
      )}
    </svg>
  );
}

export default function CurrencyDetail() {
  const { code } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const upper     = code?.toUpperCase();
  const meta      = currencyMapping[upper];

  // Use base passed from table/cards, fallback to USD (or EUR if page is USD)
  const passedBase  = location.state?.base;
  const passedBaseSupported = passedBase && FRANKFURTER_SUPPORTED.has(passedBase) && passedBase !== upper;
  const defaultBase = (() => {
    if (passedBaseSupported) return passedBase;
    if (upper === 'USD') return 'EUR';
    return 'USD';
  })();
  const [period,    setPeriod]    = useState(PERIODS[2]);
  const [chartBase, setChartBase] = useState(defaultBase);
  const [baseManuallySet, setBaseManuallySet] = useState(passedBaseSupported);
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [allRates,  setAllRates]  = useState(null); // raw rates from your backend

  const supported = FRANKFURTER_SUPPORTED.has(upper);

  // Base options: all Frankfurter-supported currencies except the page currency itself
  const baseOptions = [...FRANKFURTER_SUPPORTED].filter(c => c !== upper).sort();

  // Fetch live rates from your backend once
  useEffect(() => {
    fetch('https://fxping-d496a549fbaa.herokuapp.com/rates')
      .then(r => r.json())
      .then(data => setAllRates(data.conversion_rates))
      .catch(() => {});
  }, []);

  // Derive live rate: how much of `upper` does 1 unit of `chartBase` buy?
  // This matches the table which always shows rates relative to the selected base
  const liveRate = React.useMemo(() => {
    if (!allRates) return null;
    if (upper === chartBase) return 1;
    // conversion_rates are all relative to the API's base (USD by default)
    // rate = target / base (both relative to USD)
    const baseInUsd   = allRates[chartBase] ?? 1;
    const targetInUsd = allRates[upper]     ?? 1;
    return targetInUsd / baseInUsd;
  }, [allRates, upper, chartBase]);

  // Fetch Frankfurter historical time series
  const fetchHistory = useCallback(async () => {
    if (!supported) return;
    setLoading(true);
    setError(null);
    try {
      const start = getDateString(period.days);
      const end   = getDateString(0);
      const url   = `${FRANKFURTER_BASE}/${start}..${end}?base=${chartBase}&symbols=${upper}`;
      const res   = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const json  = await res.json();
      const entries = Object.entries(json.rates)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, rates]) => ({ date, rate: rates[upper] }));
      setChartData(entries);
    } catch (e) {
      setError('Could not load historical data.');
    } finally {
      setLoading(false);
    }
  }, [upper, period, chartBase, supported]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (!meta) {
    return (
      <div className="cd-not-found">
        <h2>Currency not found</h2>
        <Link to="/">← Back to rates</Link>
      </div>
    );
  }

  const values    = chartData.length > 0 ? chartData.map(d => d.rate) : [];
  const latest    = values.length > 0 ? values[values.length - 1] : null;
  const earliest  = values.length > 0 ? values[0] : null;
  const high      = values.length > 0 ? Math.max(...values) : null;
  const low       = values.length > 0 ? Math.min(...values) : null;
  const change    = latest !== null && earliest !== null ? latest - earliest : null;
  const changePct = change !== null && earliest ? (change / earliest) * 100 : null;
  const up        = changePct !== null && changePct >= 0;

  return (
    <div className="cd-page">

      {/* ── Navbar — reuse main navbar with no inputs ── */}
      <Header
        selectedBase="USD"
        sortedBaseCodes={[]}
        onBaseChange={() => {}}
        amount=""
        onAmountChange={() => {}}
        margin=""
        onMarginChange={() => {}}
        onExport={() => {}}
        updatedDate={null}
        currencyDetailMode
        detailCode={upper}
        detailName={meta?.currency}
        detailCountryCode={meta?.countryCode}
        detailLiveRate={liveRate}
        detailChartBase={chartBase}
        detailChartBaseCountryCode={currencyMapping[chartBase]?.countryCode}
        detailSupported={supported}
        detailBaseSupported={baseManuallySet}
        detailBaseOptions={baseOptions}
        onDetailBaseChange={e => { setChartBase(e.target.value); setBaseManuallySet(true); }}
        detailTargetOptions={[...FRANKFURTER_SUPPORTED].filter(c => c !== chartBase).sort()}
        onDetailTargetChange={e => navigate(`/currency/${e.target.value}`, { state: { base: chartBase } })}
        onDetailSwap={() => navigate(`/currency/${chartBase}`, { state: { base: upper } })}
        onBack={() => navigate(-1)}
      />

      <div className="cd-body">

        {!supported ? (
          <div className="cd-unsupported">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="13"/>
              <circle cx="12" cy="17" r="0.8" fill="#94a3b8" stroke="none"/>
            </svg>
            <h3>Historical data not available</h3>
            <p>{meta.currency} ({upper}) is not covered by our historical data source.<br/>We're working on expanding coverage.</p>
          </div>
        ) : (
          <>
            {/* ── Stats row ── */}
            {chartData.length > 0 && (
              <div className="cd-stats">
                <div className="cd-stat">
                  <span className="cd-stat-label">Current rate</span>
                  <span className="cd-stat-value">{liveRate !== null ? liveRate.toFixed(4) : latest?.toFixed(4)}</span>
                </div>
                <div className="cd-stat">
                  <span className="cd-stat-label">{period.label} change</span>
                  <span className={`cd-stat-value ${up ? 'cd-up' : 'cd-down'}`}>
                    {change !== null ? `${up ? '+' : ''}${changePct.toFixed(2)}%` : '—'}
                  </span>
                </div>
                <div className="cd-stat">
                  <span className="cd-stat-label">{period.label} high</span>
                  <span className="cd-stat-value cd-up">{high?.toFixed(4)}</span>
                </div>
                <div className="cd-stat">
                  <span className="cd-stat-label">{period.label} low</span>
                  <span className="cd-stat-value cd-down">{low?.toFixed(4)}</span>
                </div>
              </div>
            )}

            {/* ── Period selector ── */}
            <div className="cd-period-row">
              <div />
              <div className="cd-periods">
                {PERIODS.map(p => (
                  <button
                    key={p.label}
                    className={`cd-period-btn ${period.label === p.label ? 'active' : ''}`}
                    onClick={() => setPeriod(p)}
                  >{p.label}</button>
                ))}
              </div>
            </div>

            {/* ── Chart ── */}
            <div className="cd-chart-wrap">
              {loading && <div className="cd-loading"><div className="cd-spinner"/></div>}
              {error   && <div className="cd-error">{error}</div>}
              {!loading && !error && chartData.length > 0 && (
                <>
                  <div className="cd-chart">
                    <Sparkline data={chartData} />
                  </div>

                </>
              )}
            </div>
          </>
        )}

        {/* ── Info ── */}
        <div className="cd-info-grid">
          {meta.location && (
            <div className="cd-info-item">
              <span className="cd-info-label">Region</span>
              <span className="cd-info-value">{meta.location}</span>
            </div>
          )}
          {meta.numericCode && (
            <div className="cd-info-item">
              <span className="cd-info-label">Numeric code</span>
              <span className="cd-info-value">{meta.numericCode}</span>
            </div>
          )}
          <div className="cd-info-item">
            <span className="cd-info-label">ISO code</span>
            <span className="cd-info-value">{upper}</span>
          </div>
          {meta.minorUnits !== undefined && (
            <div className="cd-info-item">
              <span className="cd-info-label">Minor units</span>
              <span className="cd-info-value">{meta.minorUnits}</span>
            </div>
          )}
        </div>

        <div className="cd-source">
          Historical data via <a href="https://frankfurter.dev" target="_blank" rel="noopener noreferrer">Frankfurter</a> · European Central Bank
        </div>

      </div>
    </div>
  );
}