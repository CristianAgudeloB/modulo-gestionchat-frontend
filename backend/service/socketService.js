import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket;

export const connectSocket = (token) => {
  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
  return socket;
};

export const joinUserRoom = (userId) => {
  if (socket) socket.emit('joinUserRoom', userId);
};

export const joinGroupRoom = (groupId) => {
  if (socket) socket.emit('joinGroupRoom', groupId);
};

export const sendMessageViaSocket = (messageData) => {
  if (socket) socket.emit('sendMessage', messageData);
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const onNewMessage = (callback) => {
  if (socket) socket.on('newMessage', callback);
};

export const onNewGroupMessage = (callback) => {
  if (socket) socket.on('newGroupMessage', callback);
};