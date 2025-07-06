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
  // Suponiendo que el usuario logueado tiene un id (ajusta según tu authService)
  const loggedUser = authService.getLoggedUser();
  console.log("Usuario logueado:", loggedUser);
  const userId: string = loggedUser?.consecuser || "1"; // Usa el campo correcto

  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    apiService.getUserChats(userId)
      .then((data: ChatType[]) => {
        console.log("Chats recibidos del backend:", data);
        setChats(data);
        if (data.length > 0) setSelectedChatId(data[0].type === 'user' ? `user-${(data[0] as ChatUser).contact.CONSECUSER}` : `group-${(data[0] as ChatGroup).group.CODGRUPO}`);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los chats");
        setLoading(false);
      });
  }, [userId]);

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
    if (selectedChatId.startsWith('user-')) {
      const contactId = selectedChatId.replace('user-', '');
      apiService.getUserMessages(userId)
        .then((msgs: MensajeRaw[]) => {
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
          setLoadingMessages(false);
        })
        .catch(() => {
          setMessages([]);
          setLoadingMessages(false);
        });
    } else if (selectedChatId.startsWith('group-')) {
      const groupId = selectedChatId.replace('group-', '');
      apiService.getGroupMessages(groupId)
        .then((msgs: MensajeRaw[]) => {
          setMessages(msgs.map((msg: MensajeRaw, idx: number) => ({
            id: idx + 1,
            text: msg.LOCALIZACONTENIDO || (msg.CONTENIDOIMAG ? decodeOracleRaw(msg.CONTENIDOIMAG) : '[Mensaje sin texto]'),
            sender: msg.CONSECUSER === userId ? 'me' : 'them',
            time: msg.FECHAREGMEN
          })));
          setLoadingMessages(false);
        })
        .catch(() => {
          setMessages([]);
          setLoadingMessages(false);
        });
    }
  }, [selectedChatId, userId]);

  // Generar datos para ChatList
  const chatListData = chats.map((chat) => {
    let id: string, name: string, avatar: string, lastMessage: string, time: string;
    if (chat.type === 'user') {
      id = `user-${(chat as ChatUser).contact.CONSECUSER}`;
      name = `${(chat as ChatUser).contact.NOMBRE} ${(chat as ChatUser).contact.APELLIDO}`;
      avatar = ((chat as ChatUser).contact.NOMBRE[0] + (chat as ChatUser).contact.APELLIDO[0]).toUpperCase();
      lastMessage = (chat as ChatUser).lastMessage.LOCALIZACONTENIDO || ((chat as ChatUser).lastMessage.CONTENIDOIMAG ? decodeOracleRaw((chat as ChatUser).lastMessage.CONTENIDOIMAG) : '[Mensaje sin texto]');
      time = (chat as ChatUser).lastMessage.FECHAREGMEN;
    } else {
      id = `group-${(chat as ChatGroup).group.CODGRUPO}`;
      name = (chat as ChatGroup).group.NOMGRUPO;
      avatar = (chat as ChatGroup).group.NOMGRUPO ? (chat as ChatGroup).group.NOMGRUPO.slice(0,2).toUpperCase() : 'GR';
      lastMessage = (chat as ChatGroup).lastMessage.LOCALIZACONTENIDO || ((chat as ChatGroup).lastMessage.CONTENIDOIMAG ? decodeOracleRaw((chat as ChatGroup).lastMessage.CONTENIDOIMAG) : '[Mensaje sin texto]');
      time = (chat as ChatGroup).lastMessage.FECHAREGMEN;
    }
    return { id, name, avatar, lastMessage, time, unread: 0 };
  });
  console.log("chatListData para ChatList:", chatListData);

  const selectedChat = chats.find((chat) => {
    if (!selectedChatId) return false;
    if (chat.type === 'user') return selectedChatId === `user-${(chat as ChatUser).contact.CONSECUSER}`;
    if (chat.type === 'group') return selectedChatId === `group-${(chat as ChatGroup).group.CODGRUPO}`;
    return false;
  });

  // Nueva función para enviar mensaje
  const handleSendMessage = async (text: string) => {
    console.log('Intentando enviar mensaje:', text, 'selectedChatId:', selectedChatId);
    if (!selectedChatId || !text.trim()) return;
    let receiverId = '';
    let groupId = '';
    if (selectedChatId.startsWith('user-')) {
      receiverId = selectedChatId.replace('user-', '');
    } else if (selectedChatId.startsWith('group-')) {
      groupId = selectedChatId.replace('group-', '');
    }
    try {
      await apiService.createMessage({
        senderId: userId,
        receiverId: receiverId || undefined,
        groupId: groupId || undefined,
        content: text
      });
      // Recargar mensajes después de enviar
      if (receiverId) {
        apiService.getUserMessages(userId).then((msgs: MensajeRaw[]) => {
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
        });
      } else if (groupId) {
        apiService.getGroupMessages(groupId).then((msgs: MensajeRaw[]) => {
          setMessages(msgs.map((msg: MensajeRaw, idx: number) => ({
            id: idx + 1,
            text: msg.LOCALIZACONTENIDO || (msg.CONTENIDOIMAG ? decodeOracleRaw(msg.CONTENIDOIMAG) : '[Mensaje sin texto]'),
            sender: msg.CONSECUSER === userId ? 'me' : 'them',
            time: msg.FECHAREGMEN
          })));
        });
      }
    } catch (e) {
      alert('Error al enviar el mensaje');
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