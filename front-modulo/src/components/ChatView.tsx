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
  onSendMessage?: (text: string) => void,
  onLogout?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatName, avatar, messages: initialMessages, onSendMessage,onLogout }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleAjduntFile = () => {
    // Esta función se puede usar para adjuntar archivos

    // Aquí puedes implementar la lógica para adjuntar archivos
    alert("Funcionalidad de adjuntar archivos aún no implementada.");
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowMenu(false);
    window.location.href = "/login";
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
        <div className="logout-menu-container" ref={menuRef} style={{ position: "relative" }}>
          <button
        className="logout-menu-btn"
        onClick={toggleMenu}
          >⁝</button>
          {showMenu && (
        <div
          className="dropdown-menu">
          <button
            className="logout-button"
            onClick={handleLogout}>
            cerrar sesión
          </button>
        </div>
          )}
        </div>
      </div>

      <div className="messages-container" style={{ display: "flex", flexDirection: "column-reverse" }}>
        <div ref={messagesEndRef} />
        {messages.length === 0 ? (
          <div className="no-messages-placeholder">No hay mensajes en este chat. ¡Envía el primero!</div>
        ) : (
          messages
        .filter(message => message.text !== '[Mensaje sin texto]')
        .map((message) => (
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
      </div>

      <div className="message-input-container">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleAjduntFile}>
              <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              >
              <path d="M21.44 11.05l-8.49 8.49a5 5 0 01-7.07-7.07l9.19-9.19a3 3 0 014.24 4.24l-9.19 9.19a1 1 0 01-1.41-1.41l8.49-8.49" />
              </svg>
        </button>
        
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