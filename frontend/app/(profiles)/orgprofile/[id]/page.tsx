import { notFound } from 'next/navigation';
import { mockAcademy, mockAcademyProfile, mockPosts } from '@/lib/mockData';
import ProfileView from '@/components/profile/ProfileView';

export default function OrgProfilePage() {
  const user = mockAcademy;
  const profile = mockAcademyProfile;
  const userPosts = mockPosts.filter(post => post.user.id === user.id);

  if (!user || user.role !== 'academy') {
    return notFound();
  }

  return <ProfileView user={user} profile={profile} posts={userPosts} />;
}
