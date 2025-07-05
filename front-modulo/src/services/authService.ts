import axios, { AxiosError, type AxiosResponse } from 'axios';

// Define types for your API responses
interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    theme: number;
    avatar: any; // You might want to replace 'any' with a more specific type
  };
  token: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  theme: number;
  avatar: any;
}

interface ErrorResponse {
  error: string;
}

const API_URL = 'http://localhost:5000/api/auth';

// Helper function to handle errors
const handleError = (error: AxiosError<ErrorResponse>): string => {
  if (error.response) {
    return error.response.data.error || 'Error en la solicitud';
  } else if (error.request) {
    return 'No se recibió respuesta del servidor';
  } else {
    return 'Error al configurar la solicitud';
  }
};

export const authService = {
  
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_URL}/login`, 
        { email, password }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleError(error as AxiosError<ErrorResponse>));
    }
  },

  async register(userData: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    usuario: string;
  }): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_URL}/register`, 
        userData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleError(error as AxiosError<ErrorResponse>));
    }
  },

  async getUserData(token: string): Promise<UserData> {
    try {
      const response: AxiosResponse<UserData> = await axios.get(
        `${API_URL}/me`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleError(error as AxiosError<ErrorResponse>));
    }
  },

  // Optional: Token validation
  async validateToken(token: string): Promise<boolean> {
    try {
      await axios.get(
        `${API_URL}/validate`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Export types for use in components
export type { AuthResponse, UserData };