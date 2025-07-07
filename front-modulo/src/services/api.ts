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

  async testConnection(): Promise<{ message: string; status: string }> {
    return this.request<{ message: string; status: string }>('/test-connection');
  }

    async createGroup(
    groupName: string, 
    creatorId: string, 
    memberIds: string[]
  ): Promise<{ success: boolean; groupId: number }> {
    return this.request('/groups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupName, creatorId, memberIds }),
    });
  }

  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/messages/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Error al subir el archivo');
    return response.json();
  }

  async sendMessageWithFile({
    senderId,
    receiverId,
    groupId,
    content,
    file,
    replyTo
  }: {
    senderId: string;
    receiverId?: string;
    groupId?: string;
    content?: string;
    file?: File;
    replyTo?: string;
  }): Promise<any> {
    const body = new FormData();
    body.append('senderId', senderId);
    if (receiverId) body.append('receiverId', receiverId);
    if (groupId) body.append('groupId', groupId);
    if (content) body.append('content', content);
    if (file) body.append('file', file);
    if (replyTo) body.append('replyTo', replyTo);

    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      body,
    });

    if (!response.ok) throw new Error('Error al enviar el mensaje');
    return response.json();
  }

  async getFile(useConsecUser: string, consecUser: string, consMensaje: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/messages/file/${useConsecUser}/${consecUser}/${consMensaje}`);
    if (!response.ok) throw new Error('Error al obtener el archivo');
    return response.blob();
  }

  async getMessages(): Promise<Message[]> {
    return this.request<Message[]>('/messages');
  }

  async getChats(): Promise<Chat[]> {
    return this.request<Chat[]>('/chats');
  }

  async getMessagesByChat(chatId: number): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter(msg => msg.chat_id === chatId);
  }

  async getUserChats(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/messages/user/${userId}/chats`);
    if (!response.ok) throw new Error('Error al obtener los chats');
    return response.json();
  }

  async getUserMessages(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/messages/user/${userId}`);
    if (!response.ok) throw new Error('Error al obtener los mensajes');
    return response.json();
  }

  async getGroupMessages(groupId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/messages/group/${groupId}`);
    if (!response.ok) throw new Error('Error al obtener los mensajes de grupo');
    return response.json();
  }

  async getContacts(currentUserId: string): Promise<{ users: any[] }> {
    const response = await fetch(`${API_BASE_URL}/messages/user/contacts/${currentUserId}`);
    if (!response.ok) throw new Error('Error al obtener los contactos');
    return response.json();
  }

  async createMessage({
    senderId,
    receiverId,
    groupId,
    content,
    replyTo
  }: {
    senderId: string;
    receiverId?: string;
    groupId?: string;
    content: string;
    replyTo?: string;
  }): Promise<any> {
    const body = JSON.stringify({ senderId, receiverId, groupId, content, replyTo });
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
