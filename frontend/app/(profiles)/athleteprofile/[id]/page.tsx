import { notFound } from 'next/navigation';
import { mockUser, mockAthleteProfile, mockPosts } from '@/lib/mockData';
import ProfileView from '@/components/profile/ProfileView';

export default function AthleteProfilePage() {
  const user = mockUser;
  const profile = mockAthleteProfile;
  const userPosts = mockPosts.filter(post => post.user.id === user.id);

  if (!user || user.role !== 'athlete') {
    return notFound();
  }

  return <ProfileView user={user} profile={profile} posts={userPosts} />;
}
