import { io, Socket } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const backendUrl = apiUrl.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

const isDev = import.meta.env.DEV;

export const getSocket = () => socket;

/**
 * Connects with `localStorage` access token. Call again after login or token refresh
 * so `handshake.auth.token` matches REST.
 */
export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    socket = io(backendUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
    });
    if (isDev) {
      socket.on('connect_error', (err) => {
        console.warn('[socket] connect_error', err.message);
      });
    }
  } else {
    const prev = (socket.auth as { token?: string })?.token;
    socket.auth = { token };
    if (prev !== token && socket.connected) {
      socket.disconnect();
    }
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};

export const joinSupportTicket = (ticketId: string) => {
  if (!socket) return;
  socket.emit('join_support_ticket', ticketId);
};

export const leaveSupportTicket = (ticketId: string) => {
  if (!socket) return;
  socket.emit('leave_support_ticket', ticketId);
};

export const onSupportTicketMessage = (handler: (payload: any) => void) => {
  if (!socket) return;
  socket.on('support_ticket_message', handler);
};

export const offSupportTicketMessage = (handler: (payload: any) => void) => {
  if (!socket) return;
  socket.off('support_ticket_message', handler);
};

export const onSupportTicketError = (handler: (payload: any) => void) => {
  if (!socket) return;
  socket.on('support_ticket_error', handler);
};

export const offSupportTicketError = (handler: (payload: any) => void) => {
  if (!socket) return;
  socket.off('support_ticket_error', handler);
};
