const API_BASE_URL = 'http://localhost:3001/api';

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

  // Create a new message
  async createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<{ message: string; id: number }> {
    return this.request<{ message: string; id: number }>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
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
}

export const apiService = new ApiService(); 