import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatView from "./ChatView";
import "./ChatLayout.css";
import { authService } from "../services/authService";

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
      { id: 5, text: "Perfecto, ¿cuáles son las observaciones?", sender: "them" as const, time: "10:36 AM" },
      { id: 6, text: "Principalmente en la sección de conclusiones. Creo que necesitamos ser más específicos con los resultados.", sender: "me" as const, time: "10:38 AM" },
      { id: 7, text: "Tienes razón, ¿podemos reunirnos mañana para revisarlo juntos?", sender: "them" as const, time: "10:40 AM" },
      { id: 8, text: "¡Por supuesto! ¿A qué hora te parece bien?", sender: "me" as const, time: "10:41 AM" },
      { id: 9, text: "¿A las 2:00 PM?", sender: "them" as const, time: "10:42 AM" },
      { id: 10, text: "Perfecto, nos vemos mañana a las 2:00 PM.", sender: "me" as const, time: "10:43 AM" },
      { id: 11, text: "¡Excelente! Hasta mañana entonces.", sender: "them" as const, time: "10:44 AM" },
      { id: 12, text: "¡Hasta mañana!", sender: "me" as const, time: "10:45 AM" },
    ],
  },
  {
    id: 2,
    name: "Grupo de Trabajo",
    avatar: "GT",
    messages: [
      { id: 1, text: "María: Revisen el documento", sender: "them" as const, time: "Ayer" },
      { id: 2, text: "¡Listo!", sender: "me" as const, time: "Ayer" },
      { id: 3, text: "Carlos: Ya lo revisé, está bien", sender: "them" as const, time: "Ayer" },
      { id: 4, text: "Ana: Yo también lo revisé", sender: "them" as const, time: "Ayer" },
      { id: 5, text: "Pedro: ¿Alguien más tiene comentarios?", sender: "them" as const, time: "Ayer" },
      { id: 6, text: "Luis: Todo se ve correcto", sender: "them" as const, time: "Ayer" },
      { id: 7, text: "Sofia: Estoy de acuerdo", sender: "them" as const, time: "Ayer" },
      { id: 8, text: "María: Perfecto, entonces procedemos con el deploy", sender: "them" as const, time: "Ayer" },
      { id: 9, text: "Carlos: Confirmado", sender: "them" as const, time: "Ayer" },
      { id: 10, text: "Ana: Listo para producción", sender: "them" as const, time: "Ayer" },
      { id: 11, text: "Pedro: Deploy iniciado", sender: "them" as const, time: "Ayer" },
      { id: 12, text: "¡Excelente trabajo equipo!", sender: "me" as const, time: "Ayer" },
    ],
  },
  {
    id: 3,
    name: "Ana López",
    avatar: "AL",
    messages: [
      { id: 1, text: "Nos vemos mañana", sender: "them" as const, time: "Ayer" },
      { id: 2, text: "¡Perfecto!", sender: "me" as const, time: "Ayer" },
      { id: 3, text: "¿A qué hora?", sender: "them" as const, time: "Ayer" },
      { id: 4, text: "A las 10:00 AM", sender: "me" as const, time: "Ayer" },
      { id: 5, text: "¿En la oficina o en el café?", sender: "them" as const, time: "Ayer" },
      { id: 6, text: "En la oficina está bien", sender: "me" as const, time: "Ayer" },
      { id: 7, text: "Perfecto, nos vemos en la sala de reuniones", sender: "them" as const, time: "Ayer" },
      { id: 8, text: "¿Necesitas que prepare algo?", sender: "me" as const, time: "Ayer" },
      { id: 9, text: "Sí, trae los documentos del proyecto", sender: "them" as const, time: "Ayer" },
      { id: 10, text: "¡Listo! Los tengo preparados", sender: "me" as const, time: "Ayer" },
      { id: 11, text: "Excelente, hasta mañana", sender: "them" as const, time: "Ayer" },
      { id: 12, text: "¡Hasta mañana!", sender: "me" as const, time: "Ayer" },
    ],
  },
  {
    id: 4,
    name: "Carlos Ruiz",
    avatar: "CR",
    messages: [
      { id: 1, text: "Gracias por la información", sender: "them" as const, time: "Lunes" },
      { id: 2, text: "De nada!", sender: "me" as const, time: "Lunes" },
      { id: 3, text: "¿Necesitas algo más?", sender: "me" as const, time: "Lunes" },
      { id: 4, text: "No, por ahora está todo bien", sender: "them" as const, time: "Lunes" },
      { id: 5, text: "¿Cómo va el proyecto?", sender: "me" as const, time: "Lunes" },
      { id: 6, text: "Muy bien, avanzando según lo planeado", sender: "them" as const, time: "Lunes" },
      { id: 7, text: "¿Hay algún problema que deba conocer?", sender: "me" as const, time: "Lunes" },
      { id: 8, text: "Nada grave, solo algunos ajustes menores", sender: "them" as const, time: "Lunes" },
      { id: 9, text: "¿Necesitas ayuda con algo?", sender: "me" as const, time: "Lunes" },
      { id: 10, text: "Por ahora no, pero te aviso si surge algo", sender: "them" as const, time: "Lunes" },
      { id: 11, text: "Perfecto, estoy disponible", sender: "me" as const, time: "Lunes" },
      { id: 12, text: "Gracias, lo tendré en cuenta", sender: "them" as const, time: "Lunes" },
    ],
  },
  {
    id: 5,
    name: "Soporte Técnico",
    avatar: "ST",
    messages: [
      { id: 1, text: "Su ticket ha sido resuelto", sender: "them" as const, time: "Viernes" },
      { id: 2, text: "¡Gracias!", sender: "me" as const, time: "Viernes" },
      { id: 3, text: "¿Hay algo más en lo que podamos ayudarle?", sender: "them" as const, time: "Viernes" },
      { id: 4, text: "No, por ahora está todo bien. Muchas gracias.", sender: "me" as const, time: "Viernes" },
      { id: 5, text: "¿Puede confirmar que el problema está resuelto?", sender: "them" as const, time: "Viernes" },
      { id: 6, text: "Sí, todo funciona perfectamente", sender: "me" as const, time: "Viernes" },
      { id: 7, text: "Excelente, cerraremos el ticket", sender: "them" as const, time: "Viernes" },
      { id: 8, text: "¿Recibirá algún tipo de encuesta?", sender: "me" as const, time: "Viernes" },
      { id: 9, text: "Sí, recibirá un email con una encuesta de satisfacción", sender: "them" as const, time: "Viernes" },
      { id: 10, text: "Perfecto, la completaré", sender: "me" as const, time: "Viernes" },
      { id: 11, text: "Gracias por su paciencia", sender: "them" as const, time: "Viernes" },
      { id: 12, text: "¡De nada! Que tengan un buen día", sender: "me" as const, time: "Viernes" },
    ],
  }
];

const filteredChats = chats.filter(chat => Array.isArray(chat.messages) && chat.messages.length > 0);

// Genero los datos para ChatList a partir de filteredChats
const chatListData = filteredChats.map(chat => {
  const lastMsg = chat.messages[chat.messages.length - 1];
  return {
    id: chat.id,
    name: chat.name,
    avatar: chat.avatar,
    lastMessage: lastMsg ? lastMsg.text : '',
    time: lastMsg ? lastMsg.time : '',
    unread: 0 // Puedes cambiar esto si tienes lógica de mensajes no leídos
  };
});

const loggedUser = authService.getLoggedUser() || "Usuario";
const now = new Date();
const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const currentDate = now.toLocaleDateString();

const ChatLayout: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<number>(filteredChats[0].id);

  const selectedChat = filteredChats.find((chat) => chat.id === selectedChatId);

  return (
    <div className="chat-layout-container">
      <div className="chat-list-panel">
        <ChatList
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
          chats={chatListData}
          loggedUser={loggedUser}
          currentTime={currentTime}
          currentDate={currentDate}
          showNewChatButton={true}
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