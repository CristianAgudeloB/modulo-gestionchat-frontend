// ChatLayout.tsx
import React, { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatView from "./ChatView";
import "./ChatLayout.css";
import { authService } from "../services/authService";
import { apiService } from "../services/api";

// Tipos para los datos
interface Usuario {
  CONSECUSER: string;
  NOMBRE: string;
  APELLIDO: string;
  NOMBRE_USUARIO?: string;
}

interface MensajeRaw {
  CONSECUSER: string;
  USE_CONSECUSER: string;
  LOCALIZACONTENIDO?: string;
  CONTENIDOIMAG?: string;
  FECHAREGMEN: string;
}

interface ChatUser {
  type: 'user';
  contact: Usuario;
  lastMessage: MensajeRaw;
}

interface ChatGroup {
  type: 'group';
  group: { CODGRUPO: string; NOMGRUPO: string };
  lastMessage: MensajeRaw;
}

type ChatType = ChatUser | ChatGroup;

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

const ChatLayout: React.FC = () => {
  const loggedUser = authService.getLoggedUser();
  const userId: string = loggedUser?.consecuser || "1";

  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  useEffect(() => {
    loadChats();
  }, [userId]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const data: ChatType[] = await apiService.getUserChats(userId);
      setChats(data);
      if (data.length > 0) {
        setSelectedChatId(data[0].type === 'user' 
          ? `user-${(data[0] as ChatUser).contact.CONSECUSER}` 
          : `group-${(data[0] as ChatGroup).group.CODGRUPO}`);
      }
    } catch (error) {
      setError("Error al cargar los chats");
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para decodificar el contenido de Oracle RAW/base64
  function decodeOracleRaw(raw: string | undefined): string {
    if (!raw) return '';
    try {
      return atob(raw);
    } catch {
      return raw;
    }
  }

  // Cargar mensajes reales al seleccionar un chat
  useEffect(() => {
    if (!selectedChatId) return;
    setLoadingMessages(true);
    
    const loadMessages = async () => {
      try {
        if (selectedChatId.startsWith('user-')) {
          const contactId = selectedChatId.replace('user-', '');
          const msgs: MensajeRaw[] = await apiService.getUserMessages(userId);
          const filtered = msgs.filter((msg: MensajeRaw) =>
            (msg.CONSECUSER === userId && msg.USE_CONSECUSER === contactId) ||
            (msg.CONSECUSER === contactId && msg.USE_CONSECUSER === userId)
          );
          setMessages(filtered.map((msg: MensajeRaw, idx: number) => ({
            id: idx + 1,
            text: msg.LOCALIZACONTENIDO || (msg.CONTENIDOIMAG ? decodeOracleRaw(msg.CONTENIDOIMAG) : '[Mensaje sin texto]'),
            sender: msg.CONSECUSER === userId ? 'me' : 'them',
            time: msg.FECHAREGMEN
          })));
        } else if (selectedChatId.startsWith('group-')) {
          const groupId = selectedChatId.replace('group-', '');
          const msgs: MensajeRaw[] = await apiService.getGroupMessages(groupId);
          setMessages(msgs.map((msg: MensajeRaw, idx: number) => ({
            id: idx + 1,
            text: msg.LOCALIZACONTENIDO || (msg.CONTENIDOIMAG ? decodeOracleRaw(msg.CONTENIDOIMAG) : '[Mensaje sin texto]'),
            sender: msg.CONSECUSER === userId ? 'me' : 'them',
            time: msg.FECHAREGMEN
          })));
        }
      } catch (error) {
        setMessages([]);
        console.error("Error loading messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChatId, userId]);

  // Generar datos para ChatList
  const chatListData = chats.map((chat) => {
    let id: string, name: string, avatar: string, lastMessage: string, time: string;
    if (chat.type === 'user') {
      id = `user-${(chat as ChatUser).contact.CONSECUSER}`;
      name = `${(chat as ChatUser).contact.NOMBRE} ${(chat as ChatUser).contact.APELLIDO}`;
      avatar = ((chat as ChatUser).contact.NOMBRE[0] + (chat as ChatUser).contact.APELLIDO[0]).toUpperCase();
      lastMessage = (chat as ChatUser).lastMessage.LOCALIZACONTENIDO || 
                   ((chat as ChatUser).lastMessage.CONTENIDOIMAG ? 
                    decodeOracleRaw((chat as ChatUser).lastMessage.CONTENIDOIMAG) : 
                    '[Mensaje sin texto]');
      time = (chat as ChatUser).lastMessage.FECHAREGMEN;
    } else {
      id = `group-${(chat as ChatGroup).group.CODGRUPO}`;
      name = (chat as ChatGroup).group.NOMGRUPO;
      avatar = (chat as ChatGroup).group.NOMGRUPO ? 
               (chat as ChatGroup).group.NOMGRUPO.slice(0,2).toUpperCase() : 'GR';
      lastMessage = (chat as ChatGroup).lastMessage.LOCALIZACONTENIDO || 
                   ((chat as ChatGroup).lastMessage.CONTENIDOIMAG ? 
                    decodeOracleRaw((chat as ChatGroup).lastMessage.CONTENIDOIMAG) : 
                    '[Mensaje sin texto]');
      time = (chat as ChatGroup).lastMessage.FECHAREGMEN;
    }
    return { id, name, avatar, lastMessage, time, unread: 0 };
  });

  const selectedChat = chats.find((chat) => {
    if (!selectedChatId) return false;
    if (chat.type === 'user') return selectedChatId === `user-${(chat as ChatUser).contact.CONSECUSER}`;
    if (chat.type === 'group') return selectedChatId === `group-${(chat as ChatGroup).group.CODGRUPO}`;
    return false;
  });

  // Función para enviar mensaje
  const handleSendMessage = async (text: string) => {
    if (!selectedChatId || !text.trim()) return;
    
    try {
      let receiverId = '';
      let groupId = '';
      
      if (selectedChatId.startsWith('user-')) {
        receiverId = selectedChatId.replace('user-', '');
      } else if (selectedChatId.startsWith('group-')) {
        groupId = selectedChatId.replace('group-', '');
      }
      
      await apiService.createMessage({
        senderId: userId,
        receiverId: receiverId || undefined,
        groupId: groupId || undefined,
        content: text
      });
      
      // Recargar mensajes
      if (receiverId) {
        const msgs: MensajeRaw[] = await apiService.getUserMessages(userId);
        const filtered = msgs.filter((msg: MensajeRaw) =>
          (msg.CONSECUSER === userId && msg.USE_CONSECUSER === receiverId) ||
          (msg.CONSECUSER === receiverId && msg.USE_CONSECUSER === userId)
        );
        setMessages(filtered.map((msg: MensajeRaw, idx: number) => ({
          id: idx + 1,
          text: msg.LOCALIZACONTENIDO || (msg.CONTENIDOIMAG ? decodeOracleRaw(msg.CONTENIDOIMAG) : '[Mensaje sin texto]'),
          sender: msg.CONSECUSER === userId ? 'me' : 'them',
          time: msg.FECHAREGMEN
        })));
      } else if (groupId) {
        const msgs: MensajeRaw[] = await apiService.getGroupMessages(groupId);
        setMessages(msgs.map((msg: MensajeRaw, idx: number) => ({
          id: idx + 1,
          text: msg.LOCALIZACONTENIDO || (msg.CONTENIDOIMAG ? decodeOracleRaw(msg.CONTENIDOIMAG) : '[Mensaje sin texto]'),
          sender: msg.CONSECUSER === userId ? 'me' : 'them',
          time: msg.FECHAREGMEN
        })));
      }
    } catch (e) {
      console.error('Error sending message:', e);
      alert('Error al enviar el mensaje');
    }
  };

  // Obtener contactos (todos los usuarios excepto el actual)
  const getContacts = async ()=> {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/user/contacts/${userId}`);
      if (!response.ok) throw new Error('Error al obtener contactos');
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  };

  // Iniciar nuevo chat
  const startNewChat = async (contactId: string) => {
    try {
      // Enviar mensaje vacío
      await apiService.createMessage({
        senderId: userId,
        receiverId: contactId,
        content: '[Mensaje sin texto]'
      });

      // Recargar chats después de un breve retraso
      setTimeout(async () => {
        await loadChats();
        
        // Seleccionar el nuevo chat
        const newChatId = `user-${contactId}`;
        setSelectedChatId(newChatId);
      }, 500);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  return (
    <div className="chat-layout-container">
      <div className="chat-list-panel">
        {loading ? (
          <div>Cargando chats...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <ChatList
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
            chats={chatListData}
            loggedUser={
              loggedUser
                ? (loggedUser.nombre && loggedUser.apellido
                    ? `${loggedUser.nombre} ${loggedUser.apellido}`
                    : loggedUser.nombre || loggedUser.apellido || "Usuario")
                : "Usuario"
            }
            currentTime={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            currentDate={new Date().toLocaleDateString()}
            showNewChatButton={true}
            onGetContacts={getContacts}
            onStartNewChat={startNewChat}
          />
        )}
      </div>
      <div className="chat-view-panel">
        {selectedChat && (
          <ChatView
            chatName={selectedChat.type === 'user' ? `${selectedChat.contact.NOMBRE} ${selectedChat.contact.APELLIDO}` : selectedChat.group.NOMGRUPO}
            avatar={selectedChat.type === 'user' ? (selectedChat.contact.NOMBRE[0] + selectedChat.contact.APELLIDO[0]).toUpperCase() : (selectedChat.group.NOMGRUPO ? selectedChat.group.NOMGRUPO.slice(0,2).toUpperCase() : 'GR')}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        )}
        {loadingMessages && <div>Cargando mensajes...</div>}
      </div>
    </div>
  );
};

export default ChatLayout;