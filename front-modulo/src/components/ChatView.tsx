import React, { useState } from "react";
import "./ChatView.css";

interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  time: string;
}

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hola, ¿cómo estás?",
      sender: "them",
      time: "10:30 AM",
    },
    {
      id: 2,
      text: "¡Hola! Bien, ¿y tú?",
      sender: "me",
      time: "10:32 AM",
    },
    {
      id: 3,
      text: "Todo bien por aquí. ¿Ya revisaste el documento que te envié?",
      sender: "them",
      time: "10:33 AM",
    },
    {
      id: 4,
      text: "Sí, lo revisé ayer por la noche. Tengo algunas observaciones que podemos discutir.",
      sender: "me",
      time: "10:35 AM",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-view-container">
      <div className="chat-header">
        <div className="chat-contact">
          <div className="avatar">JP</div>
          <div className="contact-info">
            <h2>Juan Pérez</h2>
            <p>En línea</p>
          </div>
        </div>
        <button className="more-options">⋮</button>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === "me" ? "sent" : "received"}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">{message.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input-container">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSendMessage}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#ffffff"
            width="24px"
            height="24px"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatView;