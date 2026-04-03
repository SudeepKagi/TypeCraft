import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  autoConnect: false // Connect manually when needed
});

export default socket;
