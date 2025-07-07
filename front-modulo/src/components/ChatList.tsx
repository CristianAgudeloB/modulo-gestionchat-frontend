import React, { useState } from "react";
import "./ChatList.css";
import ContactModal from "./ContactModal";
import { apiService } from "../services/api";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isGroup?: boolean; // Nuevo campo para identificar grupos
  members?: string[]; // Miembros del grupo (opcional)
}

interface Contact {
  CONSECUSER: string;
  NOMBRE: string;
  APELLIDO: string;
  isGroup?: boolean; // Para distinguir entre contactos y grupos
}

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
  chats: Chat[];
  loggedUser?: string;
  currentTime?: string;
  currentDate?: string;
  showNewChatButton?: boolean;
  // Nuevas props
  onGetContacts: () => Promise<Contact[]>;
  onStartNewChat: (contactId: string) => void;
  onCreateGroup: (groupName: string, members: string[]) => Promise<void>;
}

const ChatList: React.FC<ChatListProps> = ({ 
  onSelectChat, 
  selectedChatId, 
  chats, 
  loggedUser, 
  currentTime, 
  currentDate, 
  showNewChatButton,
  onGetContacts,
  onStartNewChat,
  onCreateGroup
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(''); 
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

   const handleNewGroupClick = async () => {
    setIsGroupModalOpen(true);
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
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.CONSECUSER === contact.CONSECUSER);
      return isSelected 
        ? prev.filter(c => c.CONSECUSER !== contact.CONSECUSER)
        : [...prev, contact];
    });
  };

const handleCreateGroup = async (groupName: string, members: string[]) => {
  try {
    // 1. Validaciones básicas
    if (!groupName.trim()) {
      throw new Error('El nombre del grupo no puede estar vacío');
    }
    
    if (members.length < 1) {
      throw new Error('Debes seleccionar al menos un contacto');
    }

    // 2. Obtener el ID del usuario actual (debes tener esta información)
    // Asumiendo que loggedUser es el ID del usuario actual
    const creatorId = loggedUser; 
    if (!creatorId) {
      throw new Error('No se pudo identificar al usuario actual');
    }

    // 3. Llamar al API Service
    const group = await apiService.createGroup({
      name: groupName,
      members: [...new Set([...members, creatorId])], // Elimina duplicados
      creatorId: creatorId
    });

    // 4. Crear el objeto de chat para el grupo
    const newGroupChat = {
      id: `group_${group.id}`,
      name: group.name,
      lastMessage: "Grupo creado",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      avatar: "G", // O group.name.substring(0, 2).toUpperCase()
      isGroup: true,
      members: [...new Set([...members, creatorId])]
    };

    // 5. Retornar el nuevo chat para que el componente padre lo maneje
    return newGroupChat;

  } catch (error) {
    console.error('Error al crear grupo:', {
      error: error instanceof Error ? error.message : error,
      request: { groupName, members },
      stack: error instanceof Error ? error.stack : undefined
    });

    // Mostrar error al usuario
    if (error instanceof Error) {
      alert(error.message || 'Error al crear el grupo');
    } else {
      alert('Error al crear el grupo');
    }
    
    throw error; // Re-lanzar el error
  }
  
};
const handleGroupCreation = async (groupName: string, members: string[]) => {
  try {
    // Crea el grupo y obtiene el nuevo chat de grupo
    const newGroupChat = await handleCreateGroup(groupName, members);

    // Llama a la prop onCreateGroup para que el padre maneje el nuevo grupo
    if (onCreateGroup) {
      await onCreateGroup(newGroupChat.name, newGroupChat.members || []);
    }

    alert(`Grupo "${newGroupChat.name}" creado exitosamente!`);

    // Cierra el modal y limpia el estado
    setIsGroupModalOpen(false);
    setSelectedContacts([]);
    setGroupName('');
  } catch (error) {
    // El error ya se mostró en handleCreateGroup
  }
};



  return (
    <div className="chat-list-container">
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectContact={(contact) => {
          onStartNewChat(contact.CONSECUSER);
          setIsModalOpen(false);
        }}
        contacts={contacts}
        isLoading={isLoadingContacts}
      />
      {isGroupModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content group-modal">
            <div className="modal-header">
              <h2>Crear Nuevo Grupo</h2>
              <button className="close-button" onClick={() => {
                setIsGroupModalOpen(false);
                setSelectedContacts([]);
                setGroupName("");
              }}>×</button>
            </div>
            
            <div className="group-name-input">
              <input
                type="text"
                placeholder="Nombre del grupo"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            
            <div className="contacts-list">
              {isLoadingContacts ? (
                <div className="loading-contacts">Cargando contactos...</div>
              ) : contacts.length === 0 ? (
                <div className="no-contacts">No se encontraron contactos</div>
              ) : (
                contacts.map(contact => (
                  <div 
                    key={contact.CONSECUSER}
                    className={`contact-item ${selectedContacts.some(c => c.CONSECUSER === contact.CONSECUSER) ? 'selected' : ''}`}
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="contact-avatar">
                      {contact.NOMBRE.charAt(0)}{contact.APELLIDO.charAt(0)}
                    </div>
                    <div className="contact-info">
                      <h3>{contact.NOMBRE} {contact.APELLIDO}</h3>
                    </div>
                    {selectedContacts.some(c => c.CONSECUSER === contact.CONSECUSER) && (
                      <div className="contact-selected-check">✓</div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="modal-footer">
              <div className="selected-count">
                {selectedContacts.length} contactos seleccionados
              </div>
              <button 
               className="create-group-button"
                onClick={() => handleGroupCreation(groupName, selectedContacts.map(c => c.CONSECUSER))}
              >
              Crear Grupo
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="chat-list-header">
        <h1>Chats</h1>
        {showNewChatButton && (
          <>
            <button 
              className="new-chat-button"
              onClick={handleNewChatClick}
            >
              Nuevo Chat
            </button>
            <button 
                className="new-group-button"
                onClick={handleNewGroupClick}
              >
                Nuevo Grupo
              </button>
          </>
        )}
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