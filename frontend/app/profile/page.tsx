'use client';

import { useAuth } from '@/lib/AuthContext';
import { ProfileView } from '@/components/profile/ProfileView';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyProfilePage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser === null && typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/login');
      }
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-cobalt"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ProfileView userId={currentUser.id} />
    </div>
  );
}
