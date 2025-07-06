import React, { useState, useEffect, useRef } from "react";
import "./ChatView.css";

interface Message {
  id: number;
  text?: string;
  sender: "me" | "them";
  time: string;
  hasFile?: boolean;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  replyTo?: {
    id: number;
    text?: string;
    sender: 'me' | 'them';
    hasFile?: boolean;
  };
}

interface ChatViewProps {
  chatName: string;
  avatar: string;
  messages: Message[];
  onSendMessage?: (text: string, file?: File) => void;
  onLogout?: () => void;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  chatName,
  avatar,
  messages: initialMessages,
  onSendMessage,
  onLogout,
  replyingTo,
  setReplyingTo
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleReplyClick = (message: Message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al descargar el archivo");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || "archivo";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      alert("Error al descargar el archivo");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" && !file) return;
    try {
      if (onSendMessage) {
        await onSendMessage(newMessage, file || undefined);
      }
      setNewMessage("");
      setFile(null);
      setPreview(null);
      setReplyingTo(null);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
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
    if (onLogout) onLogout();
    setShowMenu(false);
    window.location.href = "/login";
  };

  return (
    <div className="chat-view-container" style={{ width: "100%", margin: 0, padding: 0 }}>
      <div className="chat-header">
        <div className="chat-contact">
          <div className="avatar">{avatar}</div>
          <div className="contact-info">
            <h2>{chatName}</h2>
            <p>En línea</p>
          </div>
        </div>
        <div className="logout-menu-container" ref={menuRef} style={{ position: "relative" }}>
          <button className="logout-menu-btn" onClick={toggleMenu}>
            ⁝
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button className="logout-button" onClick={handleLogout}>
                cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de respuesta */}
      {replyingTo && (
        <div className="reply-preview-bar">
          <div className="reply-preview-content">
            <span>
              Respondiendo a {replyingTo.sender === "me" ? "ti mismo" : chatName}:
            </span>
            <p>{replyingTo.text || (replyingTo.hasFile ? "[Archivo]" : "[Mensaje]")}</p>
          </div>
          <button className="cancel-reply-btn" onClick={cancelReply}>
            ×
          </button>
        </div>
      )}

      <div className="messages-container" style={{ display: "flex", flexDirection: "column" }}>
        <div ref={messagesEndRef} />
        {messages.length === 0 ? (
          <div className="no-messages-placeholder">
            No hay mensajes en este chat. ¡Envía el primero!
          </div>
        ) : (
          messages
            .filter((message) => {
              const hasValidText = typeof message.text === "string" && message.text.trim() !== "";
              const hasFileAttachment = message.hasFile && message.fileUrl;
              return hasValidText || hasFileAttachment;
            })
            .map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === "me" ? "sent" : "received"}`}
              >
                {/* Vista previa de mensaje respondido */}
                {message.replyTo && (
                  <div className={`reply-preview ${message.sender}`}>
                    <div className="reply-indicator" />
                    <div className="reply-content">
                      <span>
                        {message.replyTo.sender === "me" ? "Tú" : chatName}
                      </span>
                      <p>
                        {message.replyTo.text ||
                          (message.replyTo.hasFile ? "[Archivo]" : "[Mensaje]")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="message-content">
                  {/* Mostrar archivo adjunto si existe */}
                  {message.hasFile && message.fileUrl && (
                    <div className="file-attachment">
                      {message.fileType === "IM" ? (
                        <img
                          src={message.fileUrl}
                          alt="Imagen adjunta"
                          className="attached-image"
                          onClick={() => window.open(message.fileUrl, "_blank")}
                          onError={(e) => {
                            console.error("Error cargando imagen:", e);
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : message.fileType === "VD" ? (
                        <video
                          controls
                          className="attached-video"
                          src={message.fileUrl}
                          onError={(e) => {
                            console.error("Error cargando video:", e);
                            (e.target as HTMLVideoElement).style.display = "none";
                          }}
                        >
                          Tu navegador no soporta el elemento video.
                        </video>
                      ) : message.fileType === "AU" ? (
                        <audio
                          controls
                          className="attached-audio"
                          src={message.fileUrl}
                          onError={(e) => {
                            console.error("Error cargando audio:", e);
                            (e.target as HTMLAudioElement).style.display = "none";
                          }}
                        >
                          Tu navegador no soporta el elemento audio.
                        </audio>
                      ) : (
                        <div className="attached-document">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10,9 9,9 8,9" />
                          </svg>
                          <span>{message.fileName || "Documento adjunto"}</span>
                          <button
                            onClick={() =>
                              downloadFile(message.fileUrl!, message.fileName || "archivo")
                            }
                            className="download-btn"
                          >
                            Descargar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mostrar texto si existe */}
                  {typeof message.text === "string" &&
                    message.text.trim() !== "" &&
                    (!message.hasFile ||
                      (message.fileType !== "IM" &&
                        message.fileType !== "VD" &&
                        message.fileType !== "AU")) && <p>{message.text}</p>}

                  <span className="message-time">{message.time}</span>

                  {/* Botón de responder */}
                  <button
                    className="reply-button"
                    onClick={() => handleReplyClick(message)}
                    title="Responder"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      <div className="message-input-container">
        <input
          type="file"
          id="file-input"
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <label htmlFor="file-input" className="file-input-label">
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
        </label>
        {preview && (
          <div className="file-preview">
            <img src={preview} alt="Preview" style={{ maxWidth: "50px", maxHeight: "50px" }} />
            <button onClick={removeFile} className="remove-file-btn">
              ×
            </button>
          </div>
        )}
        {file && !preview && (
          <div className="file-preview">
            <span>{file.name}</span>
            <button onClick={removeFile} className="remove-file-btn">
              ×
            </button>
          </div>
        )}
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSendMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="24px" height="24px">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatView;