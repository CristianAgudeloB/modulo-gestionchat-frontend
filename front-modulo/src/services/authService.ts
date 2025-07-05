const API_URL = 'http://localhost:3000/api/auth';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    return response.json();
  },

  signup: async (signupData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    ubicacion: string;
  }) => {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    return response.json();
  }
};