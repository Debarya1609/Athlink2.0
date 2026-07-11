import { Profile, PublicUser } from '@/types';

interface ProfileDetailsProps {
  profile: Profile;
  user: PublicUser;
}

export default function ProfileDetails({ profile, user }: ProfileDetailsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <h2 className="text-lg font-bold text-[#334155] mb-4">Details</h2>
      
      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        {user.role === 'athlete' && (
          <>
            {profile.position && (
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Position</div>
                <div className="text-[#334155] font-medium">{profile.position}</div>
              </div>
            )}
            {profile.age && (
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Age</div>
                <div className="text-[#334155] font-medium">{profile.age} years</div>
              </div>
            )}
            {profile.height && (
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Height</div>
                <div className="text-[#334155] font-medium">{profile.height}</div>
              </div>
            )}
            {profile.weight && (
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Weight</div>
                <div className="text-[#334155] font-medium">{profile.weight}</div>
              </div>
            )}
          </>
        )}

        {user.role === 'coach' && (
          <>
            {profile.experience_years && (
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Experience</div>
                <div className="text-[#334155] font-medium">{profile.experience_years} years</div>
              </div>
            )}
            {profile.certifications && (
              <div className="col-span-2">
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Certifications</div>
                <div className="text-[#334155] font-medium">{profile.certifications}</div>
              </div>
            )}
          </>
        )}

        {user.role === 'academy' && (
          <>
            {profile.academy_type && (
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Academy Type</div>
                <div className="text-[#334155] font-medium">{profile.academy_type}</div>
              </div>
            )}
            {profile.established_year && (
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Established</div>
                <div className="text-[#334155] font-medium">{profile.established_year}</div>
              </div>
            )}
            {profile.member_count && (
              <div>
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Members</div>
                <div className="text-[#334155] font-medium">{profile.member_count}+</div>
              </div>
            )}
            {profile.website_url && (
              <div className="col-span-2">
                <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Website</div>
                <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-[#2E5BFF] font-medium hover:underline">
                  {profile.website_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {(profile.available_for_trials || profile.open_to_opportunities) && (
        <div className="mt-6 bg-[#2E5BFF]/10 border border-[#2E5BFF]/30 rounded-lg p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#2E5BFF] shadow-[0_0_8px_rgba(46,91,255,0.8)]" />
          <span className="text-[#2E5BFF] font-medium text-sm">
            {profile.available_for_trials ? 'Actively looking for trials' : 'Open to opportunities'}
          </span>
        </div>
      )}
    </div>
  );
}
