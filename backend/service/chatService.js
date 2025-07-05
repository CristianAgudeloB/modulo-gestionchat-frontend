import axios from 'axios';

const API_URL = 'http://localhost:5000/api/messages';

export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(API_URL, messageData);
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    throw error;
  }
};

export const getUserMessages = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    throw error;
  }
};

export const getGroupMessages = async (groupId) => {
  try {
    const response = await axios.get(`${API_URL}/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener mensajes de grupo:', error);
    throw error;
  }
};

export const getMessageThread = async (messageId) => {
  try {
    const response = await axios.get(`${API_URL}/thread/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener hilo de mensajes:', error);
    throw error;
  }
};