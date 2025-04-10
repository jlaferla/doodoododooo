import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file

function App() {
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState(1);
  const [selectedBase, setSelectedBase] = useState("USD");
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" for lowest first, "desc" for highest first
  const [isRateHeaderHovered, setIsRateHeaderHovered] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/rates")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((jsonData) => {
        console.log("Fetched data:", jsonData);
        setData(jsonData);
        // Use the API base code if selectedBase is not available
        if (!selectedBase || !jsonData.conversion_rates[selectedBase]) {
          setSelectedBase(jsonData.base_code);
        }
      })
      .catch((err) => {
        console.error("Error fetching rates:", err);
        setError(err.message);
      });
  }, [selectedBase]);

  const renderConversionTable = () => {
    if (!data) return <p className="message">Loading exchange rate data…</p>;
    if (!data.conversion_rates) return <p className="message">No exchange rate data available.</p>;

    // Compute cross rates relative to the selected base
    const sortedCurrencies = Object.keys(data.conversion_rates).sort((a, b) => {
      const rateA = data.conversion_rates[a] / data.conversion_rates[selectedBase];
      const rateB = data.conversion_rates[b] / data.conversion_rates[selectedBase];
      return sortOrder === "asc" ? rateA - rateB : rateB - rateA;
    });

    const rows = sortedCurrencies.map((currency) => {
      const crossRate = data.conversion_rates[currency] / data.conversion_rates[selectedBase];
      const convertedValue = amount * crossRate;
      return (
        <tr key={currency}>
          <td>{currency}</td>
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
              <th>Currency</th>
              <th 
                onMouseEnter={() => setIsRateHeaderHovered(true)}
                onMouseLeave={() => setIsRateHeaderHovered(false)}
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="sortable-header"
              >
                Rate (per 1 {selectedBase})
                <span className="sort-arrow">
                  {isRateHeaderHovered && (sortOrder === "asc" ? " ▲" : " ▼")}
                </span>
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
    <div className="container">
      <h1 className="title">Exchange Rate Converter</h1>
      {error && <p className="error">Error: {error}</p>}
      <p className="update-info">
        {data && data.time_last_update_utc
          ? `Rates updated on ${data.time_last_update_utc}`
          : "Loading exchange rates..."}
      </p>
      
      {/* Base Currency Selector */}
      {data && data.conversion_rates && (
        <div className="base-selector">
          <label>
            Base Currency:{" "}
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
      )}

      {/* Base Amount Input */}
      <div className="input-group">
        <label>
          Base Amount ({selectedBase}):{" "}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="amount-input"
          />
        </label>
      </div>

      {/* Conversion Table */}
      {renderConversionTable()}
    </div>
  );
}

export default App;
