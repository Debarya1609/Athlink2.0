'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PublicUser } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
  currentUser: PublicUser | null;
  setCurrentUser: (user: PublicUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setCurrentUser(res.data.user);
        } catch (e) {
          console.error("Failed to fetch current user", e);
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
