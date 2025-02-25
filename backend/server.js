require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST"] }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// Fetch Top 12 Stocks
app.get("/api/topstocks", async (req, res) => {
  try {
    const topStocks = [
      "AAPL", "GOOGL", "AMZN", "MSFT", "TSLA", "NVDA", 
      "META", "BRK-B", "JNJ", "V", "UNH", "JPM"
    ];
    
    const stockData = await Promise.all(
      topStocks.map(async (symbol) => {
        try {
          const stock = await yahooFinance.quoteSummary(symbol, { modules: ["price", "summaryDetail"] });
          return {
            symbol,
            name: stock?.price?.shortName || symbol,
            price: stock?.price?.regularMarketPrice || "N/A",
            change: stock?.price?.regularMarketChangePercent || "N/A",
          };
        } catch (error) {
          console.error(`Failed to fetch ${symbol}:`, error.message);
          return null;
        }
      })
    );

    res.json(stockData.filter((stock) => stock !== null));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

// Fetch Individual Stock Data
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await yahooFinance.quoteSummary(symbol, { modules: ["price", "summaryDetail"] });

    if (!stock || !stock.price) {
      return res.status(404).json({ error: "Stock data not available." });
    }

    res.json({
      symbol,
      name: stock.price.shortName || "N/A",
      price: stock.price.regularMarketPrice || "N/A",
      marketCap: stock.price.marketCap ? `$${(stock.price.marketCap / 1e9).toFixed(2)}B` : "N/A",
      dayHigh: stock.summaryDetail.dayHigh || "N/A",
      dayLow: stock.summaryDetail.dayLow || "N/A",
    });
  } catch (error) {
    console.error(`Error fetching stock (${symbol}):`, error.message);
    res.status(500).json({ error: "Failed to fetch stock data." });
  }
});

app.get("/api/videos", async (req, res) => {
  try {
    const searchQuery = "stock market basics";
    const maxResults = 6;
    const apiKey = process.env.YT_API_KEY;

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&key=${apiKey}`
    );

    const videos = response.data.items.map((video) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.medium.url,
    }));

    res.json(videos);
  } catch (error) {
    console.error("Error fetching YouTube videos:", error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// AI Chatbot with PDF Search First
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message);

  try {
    // Step 1: Search PDF
    const pdfResponse = await axios.post("http://127.0.0.1:8003/search", { query: message });
    console.log("PDF Response:", pdfResponse.data);

    if (pdfResponse.data.response) {
      return res.json({ response: pdfResponse.data.response });
    }

    // Step 2: Use Gemini AI if PDF fails
    console.log("Sending query to Gemini AI...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const botResponse = result.response?.candidates?.[0]?.content || "I couldn't fetch an answer.";

    console.log("Gemini Response:", botResponse);
    return res.json({ response: botResponse });
  } catch (error) {
    console.error("Chatbot API Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// Start the Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
