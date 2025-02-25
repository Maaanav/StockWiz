import React from "react";
import "../styles/HomePage.css";
import stockVideo from "../assets/stockmarket.mp4";

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Background Video */}
      <video autoPlay loop muted className="background-video">
        <source src={stockVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Section */}
      <div className="content">
        <h1>Welcome to StockWiz Academy</h1>
        <p>
          StockWiz Academy is designed to help you learn about the stock market in a simple and interactive way. Whether you're a beginner or someone looking to improve your trading skills, our platform provides useful tools and insights to guide you.  
        </p>

        <p>
          You can access real-time stock prices, track market trends, and explore detailed company analysis. Our AI-powered chatbot is available to answer your finance-related questions instantly, using smart search and document-based insights. We also offer educational videos to help you understand key stock market concepts.  
        </p>

        <p>
          With easy stock search and detailed charts, you can quickly find the information you need to make informed decisions. Whether you want to invest, trade, or just learn, StockWiz Academy provides the resources to help you navigate the stock market with confidence.  
        </p>

        <p className="cta">Start exploring today and take your stock market knowledge to the next level.</p>
      </div>
    </div>
  );
};

export default HomePage;
