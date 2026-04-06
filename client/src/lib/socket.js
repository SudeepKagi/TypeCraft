import { io } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from './constants';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
