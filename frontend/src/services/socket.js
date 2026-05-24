import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL;
    if (!url) {
      console.error('VITE_SOCKET_URL is not set. Socket.IO will not connect.');
      return { emit: () => {}, on: () => {}, off: () => {} }; // no-op stub
    }
    socket = io(url, { transports: ['websocket'] });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
