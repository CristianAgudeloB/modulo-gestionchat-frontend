import React from "react";
import "./ChatList.css";

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

interface ChatListProps {
  onSelectChat: (chatId: number) => void;
  selectedChatId: number;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  // Datos de ejemplo para los chats
  const chats: Chat[] = [
    {
      id: 1,
      name: "Juan Pérez",
      lastMessage: "Hola, ¿cómo estás?",
      time: "10:30 AM",
      unread: 2,
      avatar: "JP",
    },
    {
      id: 2,
      name: "Grupo de Trabajo",
      lastMessage: "María: Revisen el documento",
      time: "Ayer",
      unread: 0,
      avatar: "GT",
    },
    {
      id: 3,
      name: "Ana López",
      lastMessage: "Nos vemos mañana",
      time: "Ayer",
      unread: 5,
      avatar: "AL",
    },
    {
      id: 4,
      name: "Carlos Ruiz",
      lastMessage: "Gracias por la información",
      time: "Lunes",
      unread: 0,
      avatar: "CR",
    },
    {
      id: 5,
      name: "Soporte Técnico",
      lastMessage: "Su ticket ha sido resuelto",
      time: "Viernes",
      unread: 0,
      avatar: "ST",
    },
  ];

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h1>Chats</h1>
        <button className="new-chat-button">Nuevo Chat</button>
      </div>

      <div className="search-container">
        <input type="text" placeholder="Buscar chats..." />
      </div>

      <div className="chats-container">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item${selectedChatId === chat.id ? " selected" : ""}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="avatar">{chat.avatar}</div>
            <div className="chat-content">
              <div className="chat-header">
                <h3>{chat.name}</h3>
                <span className="time">{chat.time}</span>
              </div>
              <div className="chat-preview">
                <p>{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="unread-count">{chat.unread}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;