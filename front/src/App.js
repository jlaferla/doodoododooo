import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import currencyMapping from './currencyMapping.json';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import HeaderAd from './HeaderAd';


function App() {
  const [data, setData] = useState({ conversion_rates: {} });
  const [amount, setAmount] = useState(1);
  const [selectedBase, setSelectedBase] = useState("USD");
  // "code", "currency", "location", or "rate" for sorting
  const [sortBy, setSortBy] = useState("rate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterText, setFilterText] = useState(""); // Filter for currency codes
  // Rate filter state
  const [rateFilterComparison, setRateFilterComparison] = useState("none"); // "none", "gt", "lt"
  const [rateFilterValue, setRateFilterValue] = useState("");
  // Export menu state
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrencyFilter, setShowCurrencyFilter] = useState(false);
  const [showRateFilter, setShowRateFilter] = useState(false);
  const rateFilterRef = useRef(null);
  const currencyFilterRef = useRef(null);
  const exportMenuRef = useRef(null);



  // Fetch data from back end
  useEffect(() => {
    fetch("https://fxping-d496a549fbaa.herokuapp.com/rates")
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        if (!selectedBase || !jsonData.conversion_rates[selectedBase]) {
          setSelectedBase(jsonData.base_code);
        }
      })
      .catch((err) => setError(err.message));
  }, [selectedBase]);

  const handleSortClick = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rateFilterRef.current && !rateFilterRef.current.contains(event.target)) {
        setShowRateFilter(false);
      }
    };
  
    if (showRateFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRateFilter]);
  
  useEffect(() => {
    const handleClickOutsideCurrency = (event) => {
      if (currencyFilterRef.current && !currencyFilterRef.current.contains(event.target)) {
        setShowCurrencyFilter(false);
      }
    };
  
    if (showCurrencyFilter) {
      document.addEventListener("mousedown", handleClickOutsideCurrency);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideCurrency);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCurrency);
    };
  }, [showCurrencyFilter]);
  
  useEffect(() => {
    const handleClickOutsideExport = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuVisible(false);
      }
    };
  
    if (exportMenuVisible) {
      document.addEventListener('mousedown', handleClickOutsideExport);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideExport);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideExport);
    };
  }, [exportMenuVisible]);
  

  // Helper: Get table export data as a 2D array with header row
  const getExportData = () => {
    const headers = ["Currency Code", "Currency", "Location", "Rate", "Converted Amount"];
    const excludedCurrencies = ["ANG", "FOK", "GGP", "HRK", "IMP", "JEP", "KID", "SLL", "TVD", "XDR", "ZWL"];

    let filteredCurrencies = Object.keys(data.conversion_rates).filter((code) => {
      if (excludedCurrencies.includes(code)) return false;
      if (!code.toLowerCase().includes(filterText.toLowerCase())) return false;
      const crossRate = data.conversion_rates[code] / data.conversion_rates[selectedBase];
      if (rateFilterComparison !== "none" && rateFilterValue !== "") {
        const filterVal = parseFloat(rateFilterValue);
        if (isNaN(filterVal)) return true;
        if (rateFilterComparison === "gt" && crossRate <= filterVal) return false;
        if (rateFilterComparison === "lt" && crossRate >= filterVal) return false;
        if (!data || !data.conversion_rates || !data.conversion_rates[selectedBase]) {
          return [["No exchange rate data available"]];
        }
      }
      return true;
    });

    let sortedCurrencies = [...filteredCurrencies];
    if (sortBy === "rate") {
      sortedCurrencies.sort((a, b) => {
        const rateA = data.conversion_rates[a] / data.conversion_rates[selectedBase];
        const rateB = data.conversion_rates[b] / data.conversion_rates[selectedBase];
        return sortOrder === "asc" ? rateA - rateB : rateB - rateA;
      });
    } else if (sortBy === "currency") {
      sortedCurrencies.sort((a, b) => {
        const nameA = (currencyMapping[a] && currencyMapping[a].currency) || "";
        const nameB = (currencyMapping[b] && currencyMapping[b].currency) || "";
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (sortBy === "location") {
      sortedCurrencies.sort((a, b) => {
        const locA = (currencyMapping[a] && currencyMapping[a].location) || "";
        const locB = (currencyMapping[b] && currencyMapping[b].location) || "";
        return sortOrder === "asc" ? locA.localeCompare(locB) : locB.localeCompare(locA);
      });
    } else if (sortBy === "code") {
      sortedCurrencies.sort((a, b) => (sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)));
    }

    const rows = sortedCurrencies.map((code) => {
      const crossRate = data.conversion_rates[code] / data.conversion_rates[selectedBase];
      const convertedValue = amount * crossRate;
      const mapping = currencyMapping[code] || { currency: "Unknown", location: "Unknown" };
      return [
        code,
        mapping.currency,
        mapping.location,
        crossRate.toFixed(4),
        convertedValue.toFixed(2)
      ];
    });

    return [headers, ...rows];
  };

  // Export functions
  const exportToCSV = (exportData) => {
    const csvRows = exportData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "exchange_rates.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (exportData) => {
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rates");
    XLSX.writeFile(wb, "exchange_rates.xlsx");
  };

  const exportToPDF = (exportData) => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [exportData[0]],
      body: exportData.slice(1)
    });
    doc.save("exchange_rates.pdf");
  };

  // New handler that takes format as argument
  const handleExportSelection = (format) => {
    if (!data) return;
    const exportData = getExportData();
    if (format === "csv") {
      exportToCSV(exportData);
    } else if (format === "xlsx") {
      exportToExcel(exportData);
    } else if (format === "pdf") {
      exportToPDF(exportData);
    }
    // Hide the export menu after selection.
    setExportMenuVisible(false);
  };

  // Toggle export menu visibility.
  const toggleExportMenu = () => {
    setExportMenuVisible(!exportMenuVisible);
  };

  const renderConversionTable = () => {
    if (!data || !data.conversion_rates) {
      return <p className="message">Loading exchange rate data…</p>;
    }
        if (!data.conversion_rates) return <p className="message">No exchange rate data available.</p>;

    const excludedCurrencies = ["ANG", "FOK", "GGP", "HRK", "IMP", "JEP", "KID", "SLL", "TVD", "XDR", "ZWL"];
    let filteredCurrencies = Object.keys(data.conversion_rates).filter((code) => {
      if (excludedCurrencies.includes(code)) return false;
      if (!code.toLowerCase().includes(filterText.toLowerCase())) return false;
      const crossRate = data.conversion_rates[code] / data.conversion_rates[selectedBase];
      if (rateFilterComparison !== "none" && rateFilterValue !== "") {
        const filterVal = parseFloat(rateFilterValue);
        if (isNaN(filterVal)) return true;
        if (rateFilterComparison === "gt" && crossRate <= filterVal) return false;
        if (rateFilterComparison === "lt" && crossRate >= filterVal) return false;
      }
      return true;
    });

    let sortedCurrencies = [...filteredCurrencies];
    if (sortBy === "rate") {
      sortedCurrencies.sort((a, b) => {
        const rateA = data.conversion_rates[a] / data.conversion_rates[selectedBase];
        const rateB = data.conversion_rates[b] / data.conversion_rates[selectedBase];
        return sortOrder === "asc" ? rateA - rateB : rateB - rateA;
      });
    } else if (sortBy === "currency") {
      sortedCurrencies.sort((a, b) => {
        const nameA = (currencyMapping[a] && currencyMapping[a].currency) || "";
        const nameB = (currencyMapping[b] && currencyMapping[b].currency) || "";
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (sortBy === "location") {
      sortedCurrencies.sort((a, b) => {
        const locA = (currencyMapping[a] && currencyMapping[a].location) || "";
        const locB = (currencyMapping[b] && currencyMapping[b].location) || "";
        return sortOrder === "asc" ? locA.localeCompare(locB) : locB.localeCompare(locA);
      });
    } else if (sortBy === "code") {
      sortedCurrencies.sort((a, b) =>
        sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)
      );
    }

    const rows = sortedCurrencies.map((code) => {
      const crossRate = data.conversion_rates[code] / data.conversion_rates[selectedBase];
      const convertedValue = amount * crossRate;
      const mapping = currencyMapping[code] || { currency: "Unknown", location: "Unknown" };
      return (
        <tr key={code}>
          <td>{code}</td>
          <td>{mapping.currency}</td>
          <td>{mapping.location}</td>
          <td>{crossRate.toFixed(4)}</td>
          <td>{convertedValue.toFixed(2)}</td>
        </tr>
      );
    });
    
    return (
      <div className="table-container">
        <table className="conversion-table">
          <thead>
            <tr>
            <th style={{ position: "relative" }}>
  {showCurrencyFilter ? (
    <div ref={currencyFilterRef} style={{ display: "inline-block" }}>
      <input
        type="text"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter currency codes..."
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", boxSizing: "border-box", padding: "0.5rem", fontSize: "1rem" }}
      />
    </div>
  ) : (
    <>
      <span onClick={() => handleSortClick("code")} style={{ cursor: "pointer" }}>
        Currency Code{" "}
        <span className="sort-arrow">
          {sortBy === "code" ? (sortOrder === "asc" ? "▲" : "▼") : "⇵"}
        </span>
      </span>
      <span
        className="filter-icon"
        onClick={(e) => {
          e.stopPropagation();
          setShowCurrencyFilter(true);
        }}
        style={{ marginLeft: "5px", fontSize: "0.9rem", cursor: "pointer" }}
      >
        &#x1F50D;
      </span>
    </>
  )}
</th>

              <th onClick={() => handleSortClick("currency")} style={{ cursor: "pointer" }}>
                Currency{" "}
                <span className="sort-arrow">
                  {sortBy === "currency" ? (sortOrder === "asc" ? "▲" : "▼") : "⇵"}
                </span>
              </th>
              <th onClick={() => handleSortClick("location")} style={{ cursor: "pointer" }}>
                Location{" "}
                <span className="sort-arrow">
                  {sortBy === "location" ? (sortOrder === "asc" ? "▲" : "▼") : "⇵"}
                </span>
              </th>
              <th style={{ position: "relative" }}>
  {showRateFilter ? (
    <div ref={rateFilterRef} style={{ display: "inline-block" }}>
      <input
        type="number"
        value={rateFilterValue}
        onChange={(e) => setRateFilterValue(e.target.value)}
        placeholder="Rate..."
        onClick={(e) => e.stopPropagation()}
        style={{ width: "70px", marginRight: "5px" }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          setRateFilterComparison(rateFilterComparison === "gt" ? "lt" : "gt");
        }}
        style={{ padding: "0 5px", fontSize: "0.9rem", cursor: "pointer" }}
      >
        {rateFilterComparison === "gt" ? ">" : "<"}
      </button>
    </div>
  ) : (
    <>
      <span onClick={() => handleSortClick("rate")} style={{ cursor: "pointer" }}>
        Rate (per 1 {selectedBase})
        <span className="sort-arrow">
          {sortBy === "rate" ? (sortOrder === "asc" ? "▲" : "▼") : "⇵"}
        </span>
      </span>
      <span
        className="filter-icon"
        onClick={(e) => {
          e.stopPropagation();
          setShowRateFilter(true);
          if (rateFilterComparison === "none") {
            setRateFilterComparison("gt");
          }
        }}
        style={{ marginLeft: "5px", fontSize: "0.9rem", cursor: "pointer" }}
      >
        &#x1F50D;
      </span>
    </>
  )}
</th>

              <th>Converted Amount</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };
return (
  <div>
  <HeaderAd />

    <div className="container">

      <h1 className="title">Exchange Rate Converter</h1>
      {error && <p className="error">Error: {error}</p>}
      <p className="update-info">
        {data && data.time_last_update_utc
          ? `Rates updated on ${data.time_last_update_utc}`
          : "Loading exchange rates..."}
      </p>

      <div className="top-bar">
  <div className="center-group">
    <div className="base-selector">
      <label>
        Base Currency:&nbsp;
        <select
          value={selectedBase}
          onChange={(e) => setSelectedBase(e.target.value)}
          className="dropdown"
        >
          {Object.keys(data.conversion_rates).map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
    </div>


    <div className="input-group">
      <label>
        Base Amount ({selectedBase}):&nbsp;
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="amount-input"
        />
      </label>
    </div>
  </div>

  <div className="export-section">
    <button onClick={toggleExportMenu} className="export-button">
      Export
    </button>
    {exportMenuVisible && (
      <div className="export-menu" ref={exportMenuRef}>
        <div onClick={() => handleExportSelection("csv")}>Export as CSV</div>
        <div onClick={() => handleExportSelection("xlsx")}>Export as Excel (.xlsx)</div>
        <div onClick={() => handleExportSelection("pdf")}>Export as PDF</div>
      </div>
    )}
  </div>
</div>

      {/* Conversion Table */}
      {renderConversionTable()}
    </div>
    </div>
  );
}

export default App;
