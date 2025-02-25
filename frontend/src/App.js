import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import StockChart from "./pages/StockChart";
import LearningVideos from "./pages/LearningVideos";
import ChatBot from "./pages/ChatBot";
import "./styles/App.css";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stock-chart" element={<StockChart />} />
        <Route path="/learning-videos" element={<LearningVideos />} />
        <Route path="/chatbot" element={<ChatBot />} />
      </Routes>
    </Router>
  );
};

export default App;
