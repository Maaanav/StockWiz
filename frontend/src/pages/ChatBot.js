import { useState } from "react";
import axios from "axios";
import "../styles/ChatBot.css";
import stockVideo from "../assets/stockmarket.mp4"; // ✅ Background Video

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newChat = [...chat, { user: "You", text: message }];
    setChat(newChat);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5001/api/chat", { message });
      setChat([...newChat, { user: "Bot", text: response.data.response }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setChat([...newChat, { user: "Bot", text: "Sorry, something went wrong!" }]);
    }
  };

  return (
    <div className="chat-container">
      {/* ✅ Background Video */}
      <video autoPlay loop muted className="background-video">
        <source src={stockVideo} type="video/mp4" />
      </video>

      {/* ✅ Black Tint Overlay */}
      <div className="background-tint"></div>

      <div className="chat-overlay">
        <h1>StockWiz Bot</h1>
        <div className="chat-box">
          {chat.map((msg, index) => (
            <div key={index} className={`message ${msg.user === "You" ? "user" : "bot"}`}>
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>

        <div className="input-container">
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
