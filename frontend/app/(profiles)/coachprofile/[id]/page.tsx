import { notFound } from 'next/navigation';
import { mockCoach, mockCoachProfile, mockPosts } from '@/lib/mockData';
import ProfileView from '@/components/profile/ProfileView';

export default function CoachProfilePage() {
  const user = mockCoach;
  const profile = mockCoachProfile;
  const userPosts = mockPosts.filter(post => post.user.id === user.id);

  if (!user || user.role !== 'coach') {
    return notFound();
  }

  return <ProfileView user={user} profile={profile} posts={userPosts} />;
}
