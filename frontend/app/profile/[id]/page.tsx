'use client';

import { ProfileView } from '@/components/profile/ProfileView';

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ProfileView userId={params.id} />
    </div>
  );
}
