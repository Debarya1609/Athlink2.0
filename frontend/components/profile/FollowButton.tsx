'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  className?: string;
  onToggle?: (isFollowing: boolean) => void;
}

export function FollowButton({ userId, initialIsFollowing, className = '', onToggle }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await api.post(`/profiles/${userId}/unfollow`);
        setIsFollowing(false);
        if (onToggle) onToggle(false);
      } else {
        await api.post(`/profiles/${userId}/follow`);
        setIsFollowing(true);
        if (onToggle) onToggle(true);
      }
    } catch (err) {
      console.error('Failed to toggle follow status', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFollowing) {
    return (
      <button 
        onClick={handleToggle}
        disabled={isLoading}
        className={`px-4 py-1.5 rounded-full border border-[var(--color-gray-15)] bg-[var(--color-white)] text-[var(--color-ink)] text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-paper)] transition-colors ${className} ${isLoading ? 'opacity-50' : ''}`}
      >
        Following
      </button>
    );
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-4 py-1.5 rounded-full bg-[var(--color-ink)] text-[var(--color-white)] text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity ${className} ${isLoading ? 'opacity-50' : ''}`}
    >
      Follow
    </button>
  );
}
