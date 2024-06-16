import React, { useEffect, useState, useRef } from "react";
import "./Chat.css";
import axios from "axios";
import Cookies from "js-cookie";
import logo from "../assets/logo_tutor.png";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [SessionId, setSessionId] = useState(Cookies.get("SessionId"));
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the chat history when the component mounts
    if (SessionId) {
      const fetchChatHistory = async () => {
        try {
          const response = await axios.post(
            "https://ai-totor-b.onrender.com/history",
            {
              SessionId: SessionId,
            }
          );
          const chat_history = response.data.response;
          setMessages(chat_history);
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      };
      fetchChatHistory();
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "human",
        content: newMessage,
      },
    ]);

    setLoading(true); // Show loader while sending message

    try {
      let response;
      if (!SessionId) {
        // New session
        response = await axios.post("https://ai-totor-b.onrender.com/chat", {
          question: newMessage,
        });
        const newSessionId = response.data.SessionId;
        Cookies.set("SessionId", newSessionId, { expires: 1 });
        setSessionId(newSessionId);
      } else {
        // Existing session
        response = await axios.post("https://ai-totor-b.onrender.com/chat", {
          SessionId: SessionId,
          question: newMessage,
        });
      }

      const data = [
        {
          role: "ai",
          content: response.data.response,
        },
      ];

      setMessages((prevMessages) => [...prevMessages, ...data]);
      setNewMessage(""); // Clear input field
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false); // Hide loader
    }
    // Scroll to the bottom after sending a message
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={logo} alt="AI English Tutor Logo" className="logo" />
        <h2>AI English Tutor</h2>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-caption">
              <p>I am an AI English tutor. How can I help you?</p>
              <p>
                Unlock fluent English with your personalized AI tutor - Learn
                smarter, speak better!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.role === "human" ? "user" : "bot"
              }`}
            >
              <div
                className="message-text"
                dangerouslySetInnerHTML={{
                  __html: message.content
                    .replace(/\n/g, "<br>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              ></div>
            </div>
          ))
        )}
        {isLoading && <div className="loader">Loading...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage(e);
            }
          }}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
