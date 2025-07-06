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
  CONSMENSAJE: number;
  LOCALIZACONTENIDO?: string;
  CONTENIDOIMAG?: string;
  IDTIPOARCHIVO?: string;
  IDTIPOCONTENIDO?: string;
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
  text?: string;
  sender: 'me' | 'them';
  time: string;
  hasFile?: boolean;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
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

  // Función para decodificar contenido Oracle RAW/base64
  function decodeOracleRaw(raw: string | undefined): string {
    if (!raw) return '';
    try {
      return atob(raw);
    } catch {
      return raw;
    }
  }

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

  useEffect(() => {
    loadChats();
  }, [userId]);

  // Recargar mensajes
  const reloadMessages = async () => {
    if (!selectedChatId) return;
    
    if (selectedChatId.startsWith('user-')) {
      const contactId = selectedChatId.replace('user-', '');
      const msgs: MensajeRaw[] = await apiService.getUserMessages(userId);
      const filtered = msgs.filter((msg: MensajeRaw) =>
        (msg.CONSECUSER === userId && msg.USE_CONSECUSER === contactId) ||
        (msg.CONSECUSER === contactId && msg.USE_CONSECUSER === userId)
      );
      setMessages(filtered.map((msg: MensajeRaw, idx: number) => ({
        id: idx + 1,
        text: msg.LOCALIZACONTENIDO || (msg.CONTENIDOIMAG ? decodeOracleRaw(msg.CONTENIDOIMAG) : undefined),
        sender: msg.CONSECUSER === userId ? 'me' : 'them',
        time: msg.FECHAREGMEN,
        hasFile: !!msg.IDTIPOARCHIVO,
        fileUrl: msg.IDTIPOARCHIVO ? `http://localhost:3000/api/messages/file/${msg.USE_CONSECUSER}/${msg.CONSECUSER}/${msg.CONSMENSAJE}` : undefined,
        fileType: msg.IDTIPOARCHIVO,
        fileName: msg.LOCALIZACONTENIDO
      })));
    } else if (selectedChatId.startsWith('group-')) {
      const groupId = selectedChatId.replace('group-', '');
      const msgs: MensajeRaw[] = await apiService.getGroupMessages(groupId);
      setMessages(msgs.map((msg: MensajeRaw, idx: number) => ({
        id: idx + 1,
        text: msg.LOCALIZACONTENIDO || (msg.CONTENIDOIMAG ? decodeOracleRaw(msg.CONTENIDOIMAG) : undefined),
        sender: msg.CONSECUSER === userId ? 'me' : 'them',
        time: msg.FECHAREGMEN,
        hasFile: !!msg.IDTIPOARCHIVO,
        fileUrl: msg.IDTIPOARCHIVO ? `http://localhost:3000/api/messages/file/${msg.USE_CONSECUSER}/${msg.CONSECUSER}/${msg.CONSMENSAJE}` : undefined,
        fileType: msg.IDTIPOARCHIVO,
        fileName: msg.LOCALIZACONTENIDO
      })));
    }
  };

  // Cargar mensajes al seleccionar chat
  useEffect(() => {
    if (!selectedChatId) return;
    setLoadingMessages(true);
    reloadMessages()
      .then(() => setLoadingMessages(false))
      .catch(() => {
        setMessages([]);
        setLoadingMessages(false);
      });
  }, [selectedChatId, userId]);

  // Generar datos para ChatList
  const chatListData = chats.map((chat) => {
    let id: string, name: string, avatar: string, lastMessage: string, time: string;
    if (chat.type === 'user') {
      id = `user-${chat.contact.CONSECUSER}`;
      name = `${chat.contact.NOMBRE} ${chat.contact.APELLIDO}`;
      avatar = (chat.contact.NOMBRE[0] + chat.contact.APELLIDO[0]).toUpperCase();
      lastMessage = chat.lastMessage.LOCALIZACONTENIDO || 
        (chat.lastMessage.CONTENIDOIMAG ? decodeOracleRaw(chat.lastMessage.CONTENIDOIMAG) : 
        (chat.lastMessage.IDTIPOARCHIVO ? '[Archivo]' : '[Mensaje sin texto]'));
      time = chat.lastMessage.FECHAREGMEN;
    } else {
      id = `group-${chat.group.CODGRUPO}`;
      name = chat.group.NOMGRUPO;
      avatar = chat.group.NOMGRUPO ? chat.group.NOMGRUPO.slice(0,2).toUpperCase() : 'GR';
      lastMessage = chat.lastMessage.LOCALIZACONTENIDO || 
        (chat.lastMessage.CONTENIDOIMAG ? decodeOracleRaw(chat.lastMessage.CONTENIDOIMAG) : 
        (chat.lastMessage.IDTIPOARCHIVO ? '[Archivo]' : '[Mensaje sin texto]'));
      time = chat.lastMessage.FECHAREGMEN;
    }
    return { id, name, avatar, lastMessage, time, unread: 0 };
  });

  const selectedChat = chats.find((chat) => {
    if (!selectedChatId) return false;
    if (chat.type === 'user') return selectedChatId === `user-${(chat as ChatUser).contact.CONSECUSER}`;
    if (chat.type === 'group') return selectedChatId === `group-${(chat as ChatGroup).group.CODGRUPO}`;
    return false;
  });

  // Función para obtener contactos
  const handleGetContacts = async () => {
    try {
      const response = await apiService.getContacts(userId);
      return response.users || [];
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      return [];
    }
  };

  // Iniciar nuevo chat (envía mensaje vacío)
  const startNewChat = async (contactId: string) => {
    try {
      await apiService.createMessage({
        senderId: userId,
        receiverId: contactId,
        content: ''
      });

      setTimeout(async () => {
        await loadChats();
        setSelectedChatId(`user-${contactId}`);
      }, 500);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  // Enviar mensaje (texto o archivo)
  const handleSendMessage = async (text: string, file?: File) => {
    if (!selectedChatId || (!text.trim() && !file)) return;
    
    let receiverId = '';
    let groupId = '';
    if (selectedChatId.startsWith('user-')) {
      receiverId = selectedChatId.replace('user-', '');
    } else if (selectedChatId.startsWith('group-')) {
      groupId = selectedChatId.replace('group-', '');
    }
    
    try {
      if (file) {
        await apiService.sendMessageWithFile({
          senderId: userId,
          receiverId: receiverId || undefined,
          groupId: groupId || undefined,
          content: text,
          file
        });
      } else {
        await apiService.createMessage({
          senderId: userId,
          receiverId: receiverId || undefined,
          groupId: groupId || undefined,
          content: text
        });
      }
      await reloadMessages();
    } catch (e) {
      console.error('Error al enviar mensaje:', e);
      throw new Error('Error al enviar el mensaje');
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
            onGetContacts={handleGetContacts}
            onStartNewChat={startNewChat}
          />
        )}
      </div>
      <div className="chat-view-panel">
        {selectedChat && (
          <ChatView
            chatName={selectedChat.type === 'user' 
              ? `${selectedChat.contact.NOMBRE} ${selectedChat.contact.APELLIDO}` 
              : selectedChat.group.NOMGRUPO}
            avatar={selectedChat.type === 'user' 
              ? (selectedChat.contact.NOMBRE[0] + selectedChat.contact.APELLIDO[0]).toUpperCase() 
              : (selectedChat.group.NOMGRUPO ? selectedChat.group.NOMGRUPO.slice(0,2).toUpperCase() : 'GR')}
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