import { Profile } from '@/types';

interface ProfileAboutProps {
  profile: Profile;
}

export default function ProfileAbout({ profile }: ProfileAboutProps) {
  if (!profile.bio) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <h2 className="text-lg font-bold text-[#334155] mb-3">About</h2>
      <p className="text-[#64748B] text-sm leading-relaxed whitespace-pre-wrap">
        {profile.bio}
      </p>
    </div>
  );
}
