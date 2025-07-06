const API_BASE_URL = 'http://localhost:3000/api';

export interface Message {
  id: number;
  text: string;
  sender: 'me' | 'them';
  chat_id: number;
  created_at: string;
}

export interface Chat {
  id: number;
  name: string;
  last_message_at: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Test database connection
  async testConnection(): Promise<{ message: string; status: string }> {
    return this.request<{ message: string; status: string }>('/test-connection');
  }

  // Get all messages
  async getMessages(): Promise<Message[]> {
    return this.request<Message[]>('/messages');
  }

  // Get all chats
  async getChats(): Promise<Chat[]> {
    return this.request<Chat[]>('/chats');
  }

  // Get messages for a specific chat
  async getMessagesByChat(chatId: number): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter(msg => msg.chat_id === chatId);
  }

  // Obtener lista de chats reales para un usuario
  async getUserChats(userId: string) {
    const response = await fetch(`http://localhost:3000/api/messages/user/${userId}/chats`);
    if (!response.ok) throw new Error('Error al obtener los chats');
    return response.json();
  }

  // Obtener mensajes de usuario (chat individual)
  async getUserMessages(userId: string) {
    const response = await fetch(`http://localhost:3000/api/messages/user/${userId}`);
    if (!response.ok) throw new Error('Error al obtener los mensajes');
    return response.json();
  }

  // Obtener mensajes de grupo
  async getGroupMessages(groupId: string) {
    const response = await fetch(`http://localhost:3000/api/messages/group/${groupId}`);
    if (!response.ok) throw new Error('Error al obtener los mensajes de grupo');
    return response.json();
  }

  // Enviar mensaje (crear mensaje)
  async createMessage({ senderId, receiverId, groupId, content }: { senderId: string; receiverId?: string; groupId?: string; content: string; }) {
    const body = JSON.stringify({ senderId, receiverId, groupId, content });
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!response.ok) throw new Error('Error al enviar el mensaje');
    return response.json();
  }
}

export const apiService = new ApiService(); 