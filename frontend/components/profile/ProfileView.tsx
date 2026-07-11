import { PublicUser, Profile, Post } from '@/types';
import ProfileHeader from './ProfileHeader';
import ProfileAbout from './ProfileAbout';
import ProfileDetails from './ProfileDetails';
import ProfileFeed from './ProfileFeed';

interface ProfileViewProps {
  user: PublicUser;
  profile: Profile;
  posts: Post[];
}

export default function ProfileView({ user, profile, posts }: ProfileViewProps) {
  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 px-4 sm:px-6 mt-6">
      <ProfileHeader user={user} />
      <ProfileAbout profile={profile} />
      <ProfileDetails profile={profile} user={user} />
      <ProfileFeed posts={posts} />
    </div>
  );
}
