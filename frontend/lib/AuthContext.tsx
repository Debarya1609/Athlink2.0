'use client';

import React, { createContext, useContext, useState } from 'react';
import { PublicUser } from '@/types';
import { mockUser, mockCoach, mockAcademy } from './mockData';

interface AuthContextType {
  currentUser: PublicUser | null;
  setCurrentUser: (user: PublicUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Default to Rahul Sharma (Athlete) for Investor Demo
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(mockUser);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
