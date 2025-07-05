import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatView from "./ChatView";
import "./ChatLayout.css";

// Datos de ejemplo para los chats y mensajes
const chats = [
  {
    id: 1,
    name: "Juan Pérez",
    avatar: "JP",
    messages: [
      { id: 1, text: "Hola, ¿cómo estás?", sender: "them" as const, time: "10:30 AM" },
      { id: 2, text: "¡Hola! Bien, ¿y tú?", sender: "me" as const, time: "10:32 AM" },
      { id: 3, text: "Todo bien por aquí. ¿Ya revisaste el documento que te envié?", sender: "them" as const, time: "10:33 AM" },
      { id: 4, text: "Sí, lo revisé ayer por la noche. Tengo algunas observaciones que podemos discutir.", sender: "me" as const, time: "10:35 AM" },
    ],
  },
  {
    id: 2,
    name: "Grupo de Trabajo",
    avatar: "GT",
    messages: [
      { id: 1, text: "María: Revisen el documento", sender: "them" as const, time: "Ayer" },
      { id: 2, text: "¡Listo!", sender: "me" as const, time: "Ayer" },
    ],
  },
  {
    id: 3,
    name: "Ana López",
    avatar: "AL",
    messages: [
      { id: 1, text: "Nos vemos mañana", sender: "them" as const, time: "Ayer" },
      { id: 2, text: "¡Perfecto!", sender: "me" as const, time: "Ayer" },
    ],
  },
  {
    id: 4,
    name: "Carlos Ruiz",
    avatar: "CR",
    messages: [
      { id: 1, text: "Gracias por la información", sender: "them" as const, time: "Lunes" },
      { id: 2, text: "De nada!", sender: "me" as const, time: "Lunes" },
    ],
  },
  {
    id: 5,
    name: "Soporte Técnico",
    avatar: "ST",
    messages: [
      { id: 1, text: "Su ticket ha sido resuelto", sender: "them" as const, time: "Viernes" },
      { id: 2, text: "¡Gracias!", sender: "me" as const, time: "Viernes" },
    ],
  },
];

const ChatLayout: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<number>(chats[0].id);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  return (
    <div className="chat-layout-container">
      <div className="chat-list-panel">
        <ChatList
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </div>
      <div className="chat-view-panel">
        {selectedChat && (
          <ChatView
            chatName={selectedChat.name}
            avatar={selectedChat.avatar}
            messages={selectedChat.messages}
          />
        )}
      </div>
    </div>
  );
};

export default ChatLayout; 