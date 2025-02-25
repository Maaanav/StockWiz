import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/StockChart.css";

const StockChart = () => {
  const [topStocks, setTopStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedStock, setSearchedStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5001/api/topstocks");
        setTopStocks(response.data);
      } catch (err) {
        setError("Failed to load stock data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopStocks();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5001/api/stock/${searchQuery}`);
      setSearchedStock(response.data);
      setError(null);
    } catch (err) {
      setSearchedStock(null);
      setError("Stock not found. Try a valid symbol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-container">
      <video className="background-video" autoPlay loop muted>
        <source src="/assets/videos/stockmarket.mp4" type="video/mp4" />
      </video>

      <div className="content">
        <h2 className="title">Stock Market Overview</h2>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search stock by symbol (e.g., AAPL, TSLA)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {/* Searched Stock Data */}
        {searchedStock && (
          <div className="stock-table-container">
            <h3>Search Result</h3>
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Stock Name</th>
                  <th>Symbol</th>
                  <th>Price ($)</th>
                  <th>Market Cap</th>
                  <th>Day High</th>
                  <th>Day Low</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{searchedStock.name}</td>
                  <td>{searchedStock.symbol}</td>
                  <td>${searchedStock.price}</td>
                  <td>{searchedStock.marketCap}</td>
                  <td>${searchedStock.dayHigh}</td>
                  <td>${searchedStock.dayLow}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Top Stocks Table */}
        <div className="stock-table-container">
          <h3>Market Leaders</h3>
          <table className="stock-table">
            <thead>
              <tr>
                <th>Stock Name</th>
                <th>Symbol</th>
                <th>Price ($)</th>
                <th>Change (%)</th>
              </tr>
            </thead>
            <tbody>
              {topStocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td>{stock.name}</td>
                  <td>{stock.symbol}</td>
                  <td>${stock.price}</td>
                  <td className={stock.change >= 0 ? "positive" : "negative"}>
                    {stock.change}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default StockChart;
