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

export interface Group {
  id: number;
  name: string;
  members: string[];
  creatorId: string;
  imageUrl?: string;
  createdAt?: string;
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
  file 
}: { 
  senderId: string; 
  receiverId?: string; 
  groupId?: string; 
  content?: string; 
  file?: File 
}): Promise<any> {
  const body = new FormData();
  body.append('senderId', senderId);
  if (receiverId) body.append('receiverId', receiverId);
  if (groupId) body.append('groupId', groupId);
  if (content) body.append('content', content);
  if (file) body.append('file', file);

  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    body,
  });

  if (!response.ok) throw new Error('Error al enviar el mensaje');
  return response.json();
}


// Crear grupo
async createGroup(data: {
  name: string;
  members: string[];
  creatorId: string;
  image?: File;
}): Promise<Group> {
  try {
    // 1. Verificar conexión antes de intentar
    await this.testConnection();

    // 2. Preparar FormData
    const formData = new FormData();
    formData.append('groupName', data.name);
    data.members.forEach(member => formData.append('members', member));
    formData.append('creatorId', data.creatorId);
    if (data.image) formData.append('image', data.image);

    // 3. Configuración de fetch con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout

    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    clearTimeout(timeoutId);

    // 4. Manejo de respuesta
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      } catch {
        throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();

  } catch (error) {
    console.error('Error completo en createGroup:', {
      error: (error instanceof Error ? error.message : String(error)),
      requestData: {
        name: data.name,
        members: data.members,
        hasImage: !!data.image
      },
      apiUrl: `${API_BASE_URL}/groups`,
      timestamp: new Date().toISOString()
    });

    // Mensajes de error más descriptivos
    if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError') {
      throw new Error('El servidor no respondió a tiempo. Verifica tu conexión.');
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar al servidor. Verifica: \n1. Que el servidor esté corriendo\n2. Que la URL sea correcta\n3. Tu conexión a internet');
    }

    throw error; // Re-lanzar otros errores
  }
}

// Añadir miembros a grupo
async addGroupMembers(groupId: number, members: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ members })
  });

  if (!response.ok) throw new Error('Error al añadir miembros al grupo');
}

// Enviar mensaje a grupo
async sendGroupMessage({ groupId, senderId, content, file }: {
  groupId: number;
  senderId: string;
  content?: string;
  file?: File;
}): Promise<void> {
  const formData = new FormData();
  formData.append('senderId', senderId);
  if (content) formData.append('content', content);
  if (file) formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/messages`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Error al enviar mensaje al grupo');
}

// Obtener mensajes de grupo
async getGroupMessages(groupId: number): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/messages`);
  if (!response.ok) throw new Error('Error al obtener mensajes del grupo');
  return response.json();
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

  async getContacts(currentUserId: string): Promise<{ users: any[] }> {
    const response = await fetch(`${API_BASE_URL}/messages/user/contacts/${currentUserId}`);
    if (!response.ok) throw new Error('Error al obtener los contactos');
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