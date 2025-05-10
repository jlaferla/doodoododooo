// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ReactGA from 'react-ga4';
import './App.css';
import currencyMapping from './currencyMapping.json';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import HeaderAd from './HeaderAd';
import SidebarAd from './SidebarAd';
import Header from './Header';
import Footer from './Footer';
import Home from './pages/Home';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

function ConversionUI() {
  // — State & refs —
  const [data, setData] = useState({ conversion_rates: {} });
  const [amountStr, setAmountStr] = useState('1');      // <-- new
  const [amount, setAmount] = useState('1');
  const [selectedBase, setSelectedBase] = useState('USD');
  const [margin, setMargin] = useState('0');
  const [sortBy, setSortBy] = useState('rate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterText, setFilterText] = useState('');
  const [rateFilterComparison, setRateFilterComparison] = useState('none');
  const [rateFilterValue, setRateFilterValue] = useState('');
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrencyFilter, setShowCurrencyFilter] = useState(false);
  const [showRateFilter, setShowRateFilter] = useState(false);
  const rateFilterRef = useRef();
  const currencyFilterRef = useRef();
  const exportMenuRef = useRef();
  const baseCodes     = Object.keys(data.conversion_rates);
  const priority      = ['USD','EUR','GBP','AUD','CAD','ZAR'];
  const sortedBaseCodes = [
    // keep only those that actually exist in your rates
    ...priority.filter(c => baseCodes.includes(c)),
    // then the rest, alphabetically
    ...baseCodes.filter(c => !priority.includes(c)).sort()
  ];



  // — Analytics —
  ReactGA.initialize('G-5RN2X8MD4P');
  ReactGA.send('pageview');

  // — Fetch rates (only once per selectedBase change) —
  useEffect(() => {
    fetch('https://fxping-d496a549fbaa.herokuapp.com/rates')
      .then(res => res.json())
      .then(json => {
        setData(json);
        if (!json.conversion_rates[selectedBase]) {
          setSelectedBase(json.base_code);
        }
      })
      .catch(err => setError(err.message));
  }, [selectedBase]);

  // — Click‑outside handlers for filters & export menu —
  useEffect(() => {
    function onClick(e) {
      if (showRateFilter && rateFilterRef.current && !rateFilterRef.current.contains(e.target)) {
        setShowRateFilter(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showRateFilter]);

  useEffect(() => {
    function onClick(e) {
      if (showCurrencyFilter && currencyFilterRef.current && !currencyFilterRef.current.contains(e.target)) {
        setShowCurrencyFilter(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showCurrencyFilter]);

  useEffect(() => {
    function onClick(e) {
      if (exportMenuVisible && exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuVisible(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [exportMenuVisible]);

  // — Helpers for sorting/filtering/exporting —
  const handleSortClick = col => {
    if (sortBy === col) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  function getFilteredSortedCodes() {
    const exclude = ['ANG','FOK','GGP','HRK','IMP','JEP','KID','SLL','TVD','XDR','ZWL'];
    let codes = Object.keys(data.conversion_rates)
      .filter(c => !exclude.includes(c) && c.toLowerCase().includes(filterText.toLowerCase()));

    // apply rate filter
    if (rateFilterComparison !== 'none' && rateFilterValue !== '') {
      const v = parseFloat(rateFilterValue);
      codes = codes.filter(c => {
        const r = data.conversion_rates[c] / data.conversion_rates[selectedBase];
        return rateFilterComparison === 'gt' ? r > v : r < v;
      });
    }

    // sort
    return codes.sort((a,b) => {
      let A, B;
      switch(sortBy) {
        case 'code':   A=a; B=b; return sortOrder==='asc'? A.localeCompare(B):B.localeCompare(A);
        case 'currency':
          A=currencyMapping[a]?.currency||''; B=currencyMapping[b]?.currency||'';
          return sortOrder==='asc'? A.localeCompare(B):B.localeCompare(A);
        case 'location':
          A=currencyMapping[a]?.location||''; B=currencyMapping[b]?.location||'';
          return sortOrder==='asc'? A.localeCompare(B):B.localeCompare(A);
        case 'rate':
        default:
          A=data.conversion_rates[a]/data.conversion_rates[selectedBase];
          B=data.conversion_rates[b]/data.conversion_rates[selectedBase];
          return sortOrder==='asc'? A-B:B-A;
      }
    });
  }

  const getExportData = () => {
    // build a 7-column header row
    const headers = [
      'Currency Code',
      'Currency',
      'Location',
      'Rate',
      'Converted Amount',
      'Margined Rate',
      'Margined Amount'
    ];
  
    // compute the margin factor once
    const factor = 1 + (parseFloat(margin) || 0) / 100;
  
    // for each code: raw rate, converted amount, and their margined variants
    const rows = getFilteredSortedCodes().map(code => {
      const rate = data.conversion_rates[code] / data.conversion_rates[selectedBase];
      const converted = rate * (parseFloat(amount) || 0);
  
      // determine how many decimals this currency uses
      const units = Number(currencyMapping[code]?.minorUnits ?? 2);
      const decimals = units === 0 ? 0 : units === 3 ? 3 : 2;
  
      const marginedRate   = rate * factor;
      const marginedAmount = converted * factor;
  
      return [
        code,
        currencyMapping[code]?.currency || '',
        currencyMapping[code]?.location || '',
        rate.toFixed(4),
        converted.toFixed(decimals),
        marginedRate.toFixed(4),
        marginedAmount.toFixed(decimals)
      ];
    });
  
    return [headers, ...rows];
  };
  
  const exportToCSV = dt => {
    const csv = dt.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download='exchange_rates.csv';
    link.click();
  };
  const exportToExcel = dt=>{
    const ws=XLSX.utils.aoa_to_sheet(dt);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Rates');
    XLSX.writeFile(wb,'exchange_rates.xlsx');
  };
  const exportToPDF = dt=>{
    const doc=new jsPDF();
    autoTable(doc,{head:[dt[0]],body:dt.slice(1)});
    doc.save('exchange_rates.pdf');
  };
  const handleExportSelection = fmt=>{
    const dt = getExportData();
    if(fmt==='csv') exportToCSV(dt);
    else if(fmt==='xlsx') exportToExcel(dt);
    else if(fmt==='pdf') exportToPDF(dt);
    setExportMenuVisible(false);
  };
// inside your ConversionUI component

const handleAmountChange = (e) => {
  // strip commas
  const raw = e.target.value.replace(/,/g, '');
  // count only the digits (ignore the decimal point)
  const digitCount = raw.replace(/\D/g, '').length;

  // allow:
  //   • empty string
  //   • a single dot (user just typed “.”)
  //   • or a number with up to 3 decimals, AND ≤12 digits total
  if (
    raw === '' ||
    raw === '.' ||
    (
      /^[0-9]+(\.[0-9]{0,3})?$/.test(raw) &&
      digitCount <= 12
    )
  ) {
    setAmount(raw);
  }
};
    



// — Render the table —
  const renderConversionTable = () => {
    if (!data.conversion_rates) return <p className="message">No exchange rate data available.</p>;
// lift these seven to the top:
const priority  = ['USD','EUR','GBP','AUD','CAD','AED','ZAR'];
// get your filtered+sorted list:
const allCodes  = getFilteredSortedCodes();
// split into “top” vs “others”
const topCodes  = priority.filter(c => allCodes.includes(c));
const otherCodes = allCodes.filter(c => !topCodes.includes(c));
// final list, with those seven first
const codesToDisplay = [...topCodes, ...otherCodes];

    return (
      <div className="table-container">
        <table className="conversion-table">
          <thead>
            <tr>
              <th style={{position:'relative'}}>
              {showCurrencyFilter ? (
  <div ref={currencyFilterRef} style={{ display: "inline-block" }}>
    <input
      type="text"
      value={filterText}
      onChange={e => {
        // only letters, uppercase, max 3 chars
        const v = e.target.value
          .toUpperCase()
          .replace(/[^A-Z]/g, "")
          .slice(0, 3);
        setFilterText(v);
      }}
      placeholder="ABC"
      maxLength={3}
      onClick={e => e.stopPropagation()}
      style={{
        width: "6ch",               // just wide enough for 3 letters
        boxSizing: "border-box",
        padding: "0.5rem",
        fontSize: "1rem",
        textTransform: "uppercase"
      }}
    />
  </div>                ) : (
                  <>
                    <span onClick={()=>handleSortClick('code')} style={{cursor:'pointer'}}>
                      Code <span className="sort-arrow">{sortBy==='code'? (sortOrder==='asc'?'▲':'▼'):'⇵'}</span>
                    </span>
                    <span
                      className="filter-icon"
                      onClick={e=>{e.stopPropagation();setShowCurrencyFilter(true);}}
                    >🔍</span>
                  </>
                )}
              </th>

              <th onClick={()=>handleSortClick('currency')} style={{cursor:'pointer'}}>
                Currency <span className="sort-arrow">{sortBy==='currency'? (sortOrder==='asc'?'▲':'▼'):'⇵'}</span>
              </th>
              <th onClick={()=>handleSortClick('location')} style={{cursor:'pointer'}}>
                Location <span className="sort-arrow">{sortBy==='location'? (sortOrder==='asc'?'▲':'▼'):'⇵'}</span>
              </th>

              <th style={{position:'relative'}}>
                {showRateFilter ? (
                  <div ref={rateFilterRef}>
                  <input
                    type="number"
                    value={rateFilterValue}
                    onChange={(e) => setRateFilterValue(e.target.value)}
                    placeholder="Rate"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "6ch",              // shrink to about 5 characters
                      padding: "0.2rem",        // a bit tighter
                      fontSize: "0.8rem",
                      marginRight: "0.2ch",
                      textAlign: "right"
                    }}
                  />
                    <button
                      onClick={e=>{e.stopPropagation();setRateFilterComparison(c=>c==='gt'?'lt':'gt');}}
                    >
                      {rateFilterComparison==='gt'?'>':'<'}
                    </button>
                  </div>
                ) : (
                  <>
                    <span onClick={()=>handleSortClick('rate')} style={{cursor:'pointer'}}>
                      Rate <span className="sort-arrow">{sortBy==='rate'? (sortOrder==='asc'?'▲':'▼'):'⇵'}</span>
                    </span>
                    <span
                      className="filter-icon"
                      onClick={e=>{e.stopPropagation();setShowRateFilter(true); if(rateFilterComparison==='none') setRateFilterComparison('gt');}}
                    >🔍</span>
                  </>
                )}
              </th>

              <th>Converted Amount</th>
              <th>Margined Rate</th>
              <th>Margined Amount</th>

            </tr>
          </thead>
          <tbody>
            {codesToDisplay.map(code => {
              const rate = data.conversion_rates[code]/data.conversion_rates[selectedBase];
              const converted = rate * amount;
              const marginValue = parseFloat(margin) || 0;
              const factor = 1 + marginValue/100;
              const marginedRate   = rate * factor;
              const marginedAmount = converted * factor;

              return (
                <tr key={code}>
                  <td>{code}</td>
                  <td>{currencyMapping[code]?.currency}</td>
                  <td>{currencyMapping[code]?.location}</td>
                  <td>
                    {rate > 1000
                      ? rate.toLocaleString(undefined, {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4
                        })
                      : rate.toFixed(4)}
                  </td>
                  <td>
                    {(() => {
                      const units = Number(currencyMapping[code]?.minorUnits ?? 2);
                      const decimals = units === 0 ? 0 : units === 3 ? 3 : 2;
                      return (rate * amount).toLocaleString(undefined, {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals
                      });
                    })()}
                  </td>
                  <td>
                    {marginedRate.toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4
                    })}
                  </td>
                  <td>
                  {(() => {
                      const units = Number(currencyMapping[code]?.minorUnits ?? 2);
                      const decimals = units === 0 ? 0 : units === 3 ? 3 : 2;
                    return marginedAmount.toLocaleString(undefined, {
                      minimumFractionDigits: decimals,
                      maximumFractionDigits: decimals
                    });
                  })()}
                   </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // — Main UI —
  return (
    <>
      <div className="container">
        <h1 className="title">Rate Hub</h1>
        {error && <p className="error">Error: {error}</p>}
        <p className="update-info">
          {data.time_last_update_utc
            ? `Updated: ${data.time_last_update_utc}`
            : 'Loading rates…'}
        </p>

        <div className="top-bar">
          <div className="center-group">
            <div className="base-selector">
              <label>
                Base Currency:&nbsp;
                <select
                  className="dropdown"
                  value={selectedBase}
                  onChange={e => setSelectedBase(e.target.value)}
                >
                  {sortedBaseCodes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
      </select>
              </label>
            </div>
            <div className="input-group">
              <label>
              <label>
                 Amount ({selectedBase}):&nbsp;
                <input
                type="text"
                value={
                  // insert commas every 3 digits before the “.”
                  amount.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ','
                  )
                }
                onChange={handleAmountChange}
                className="amount-input"
              /></label>
             </label>
            </div>
            <div className="margin-group">
          <label>
            Margin (%):&nbsp;
            <input
              type="text"
              className="margin-input"
              value={margin}
              maxLength={6}      // still a hard cap for keystrokes
              onChange={e => {
                const raw = e.target.value;
                // allow only digits and one decimal point
                if (!/^[0-9]*\.?[0-9]*$/.test(raw)) return;
                // enforce max‐length
                if (raw.length > 7) return;
                setMargin(raw);
              }}
              placeholder="0"
            />
          </label>
        </div>
          </div>


          <div className="export-section">
            <button onClick={()=>setExportMenuVisible(v=>!v)} className="export-button">
              Export
            </button>
            {exportMenuVisible && (
              <div className="export-menu" ref={exportMenuRef}>
                <div onClick={()=>handleExportSelection('csv')}>CSV</div>
                <div onClick={()=>handleExportSelection('xlsx')}>Excel</div>
                <div onClick={()=>handleExportSelection('pdf')}>PDF</div>
              </div>
            )}
          </div>
        </div>

        <div className="page-container">
          <aside className="sidebar left-sidebar">
            <SidebarAd adSlot="8460430591" />
          </aside>
          <main className="main-content">{renderConversionTable()}</main>
          <aside className="sidebar right-sidebar">
            <SidebarAd adSlot="8268858906" />
          </aside>
        </div>
      </div>
    </>
  );
}

function App() {
  
  return (
    <>
      <Header />
      <HeaderAd />

      <Routes>
        <Route path="/" element={<ConversionUI />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
