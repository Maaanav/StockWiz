import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">StockWiz Academy</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/stock-chart">Stock Chart</Link></li>
        <li><Link to="/learning-videos">Learning Videos</Link></li>
        <li><Link to="/chatbot">ChatBot</Link></li> 
        <li><Link to="/chatbot"> </Link></li> {/* Ensure it's "ChatBot" */}
      </ul>
    </nav>
  );
};

export default Navbar;
