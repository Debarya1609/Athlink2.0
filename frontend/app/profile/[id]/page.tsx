'use client';

import { ProfileView } from '@/components/profile/ProfileView';

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="py-8">
      <ProfileView userId={params.id} />
    </div>
  );
}
