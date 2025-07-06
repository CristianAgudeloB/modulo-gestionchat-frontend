import React, { useState, useEffect, useRef } from "react";
import "./ChatView.css";

interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  time: string;
}

interface ChatViewProps {
  chatName: string;
  avatar: string;
  messages: Message[];
  onSendMessage?: (text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatName, avatar, messages: initialMessages, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    if (onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage("");
    } else {
      const newMsg: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-view-container" style={{ width: '100%', margin: 0, padding: 0 }}>
      <div className="chat-header">
        <div className="chat-contact">
          <div className="avatar">{avatar}</div>
          <div className="contact-info">
            <h2>{chatName}</h2>
            <p>En línea</p>
          </div>
        </div>
        <button className="more-options">⋮</button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages-placeholder">No hay mensajes en este chat. ¡Envía el primero!</div>
        ) : (
          messages.filter(message => message.text !== '[Mensaje sin texto]').map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === "me" ? "sent" : "received"}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">{message.time}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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