import { Socket } from 'socket.io-client';
export declare const getSocket: () => Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap> | null;
/**
 * Connects with `localStorage` access token. Call again after login or token refresh
 * so `handshake.auth.token` matches REST.
 */
export declare const connectSocket: () => Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap> | null;
export declare const disconnectSocket: () => void;
export declare const joinSupportTicket: (ticketId: string) => void;
export declare const leaveSupportTicket: (ticketId: string) => void;
export declare const onSupportTicketMessage: (handler: (payload: any) => void) => void;
export declare const offSupportTicketMessage: (handler: (payload: any) => void) => void;
export declare const onSupportTicketError: (handler: (payload: any) => void) => void;
export declare const offSupportTicketError: (handler: (payload: any) => void) => void;
