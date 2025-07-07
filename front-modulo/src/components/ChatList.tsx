import React, { useState } from "react";
import "./ChatList.css";
import ContactModal from "./ContactModal";
import CreateGroupModal from "./CreateGroupModal";
import { apiService } from "../services/api";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

interface Contact {
  CONSECUSER: string;
  NOMBRE: string;
  APELLIDO: string;
}

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
  chats: Chat[];
  loggedUser?: string;
  currentTime?: string;
  currentDate?: string;
  showNewChatButton?: boolean;
  currentUserId: string;
  onGetContacts: () => Promise<Contact[]>;
  onStartNewChat: (contactId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  onSelectChat, 
  selectedChatId, 
  chats, 
  loggedUser, 
  currentTime, 
  currentDate, 
  showNewChatButton,
  currentUserId,
  onGetContacts,
  onStartNewChat
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const handleNewChatClick = async () => {
    setIsModalOpen(true);
    setIsLoadingContacts(true);
    try {
      const contactsData = await onGetContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    onStartNewChat(contact.CONSECUSER);
    setIsModalOpen(false);
  };

   const handleNewGroupClick = async () => {
    setCreateGroupModalOpen(true);
    setIsLoadingContacts(true);
    try {
      const contactsData = await onGetContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleCreateGroup = async (groupName: string, selectedMemberIds: string[]) => {
    try {
      await apiService.createGroup(groupName, currentUserId, selectedMemberIds);
      setCreateGroupModalOpen(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="chat-list-container">
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectContact={handleSelectContact}
        contacts={contacts}
        isLoading={isLoadingContacts}
      />
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        contacts={contacts}
        onCreateGroup={handleCreateGroup}
        isLoading={isLoadingContacts}
      />
      
      <div className="chat-list-header">
        <h1>Chats</h1>
        {showNewChatButton && (
          <button 
            className="new-chat-button"
            onClick={handleNewChatClick}
          >
            Nuevo Chat
          </button>
        )}
          <button 
            className="new-chat-button"
            onClick={handleNewGroupClick}
          >
            Nuevo Grupo
          </button>
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