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
  chats: Chat[];
  loggedUser?: string;
  currentTime?: string;
  currentDate?: string;
  showNewChatButton?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId, chats, loggedUser, currentTime, currentDate, showNewChatButton }) => {
  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h1>Chats</h1>
        {showNewChatButton && <button className="new-chat-button">Nuevo Chat</button>}
      </div>
      <div className="chat-user-info">
        <span className="user-name">{loggedUser || "Usuario"}</span>
        <span className="user-time">{currentTime || "--:--"}</span>
        <span className="user-date">{currentDate || "--/--/----"}</span>
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