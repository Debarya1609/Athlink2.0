'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getToken } from './auth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!currentUser) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        queueMicrotask(() => {
          setSocket(null);
          setIsConnected(false);
        });
      }
      return;
    }

    const token = getToken();
    if (!token) return;

    // We assume NEXT_PUBLIC_API_URL is like "http://localhost:5000/api"
    // So the socket URL should just be "http://localhost:5000"
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const socketInstance = io(backendUrl, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Connected to socket.io server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket.io server');
      setIsConnected(false);
    });

    // Global notification listener
    socketInstance.on('new_notification', (data) => {
      // In a real app, you would show a toast here or update a global notification badge
      console.log('New real-time notification!', data);
      // We could dispatch an event here that any component could listen to
      const event = new CustomEvent('globalNotification', { detail: data });
      window.dispatchEvent(event);
    });

    queueMicrotask(() => {
      setSocket(socketInstance);
    });

    return () => {
      socketInstance.disconnect();
      if (socketRef.current === socketInstance) {
        socketRef.current = null;
      }
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
