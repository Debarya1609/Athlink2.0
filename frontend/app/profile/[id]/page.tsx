'use client';

import { use } from 'react';
import { ProfileView } from '@/components/profile/ProfileView';

export default function UserProfilePage({ params }: { params: any }) {
  const unwrappedParams = use(params as any) as { id: string };
  return (
    <div className="py-8">
      <ProfileView userId={unwrappedParams.id} />
    </div>
  );
}
