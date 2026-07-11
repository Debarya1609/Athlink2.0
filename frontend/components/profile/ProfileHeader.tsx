import { PublicUser } from '@/types';

interface ProfileHeaderProps {
  user: PublicUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  let roleColorClass = "text-[#3B82F6] bg-[#3B82F6]/10";
  if (user.role === 'coach') roleColorClass = "text-[#10B981] bg-[#10B981]/10";
  if (user.role === 'academy') roleColorClass = "text-[#D4AF37] bg-[#D4AF37]/10";

  return (
    <div className="bg-white text-[#334155] relative rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Cover Photo Placeholder */}
      <div className="h-32 md:h-48 bg-[#E2E8F0] w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="px-4 pb-6 -mt-12 relative z-10 flex flex-col items-center sm:items-start sm:px-6 md:px-8">
        {/* Profile Picture */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#9455B7] to-[#2E5BFF] p-1 mb-4 shadow-sm relative">
          <div className="w-full h-full rounded-full border-2 border-white bg-[#F0F2F5] flex items-center justify-center overflow-hidden">
            {user.photo_url ? (
              <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-[#64748B] font-bold">{user.name.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="text-center sm:text-left w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#334155]">{user.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleColorClass}`}>
                  {user.role}
                </span>
                <span className="text-sm text-[#64748B]">
                  {user.sport} • {user.city}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-4 sm:mt-0 flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none h-11 px-6 bg-[#2E5BFF] hover:scale-105 transition-transform duration-300 text-white font-bold rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)] flex items-center justify-center">
                Follow
              </button>
              <button className="flex-1 sm:flex-none h-11 px-6 bg-[#000000] hover:scale-105 transition-transform duration-300 text-white font-bold rounded-full flex items-center justify-center">
                Message
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center sm:justify-start gap-6 mt-6 pt-4 border-t border-[#E2E8F0]">
            <div className="text-center sm:text-left">
              <div className="text-lg font-bold text-[#334155]">{user.followers_count}</div>
              <div className="text-xs text-[#64748B] uppercase tracking-wider">Followers</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-lg font-bold text-[#334155]">{user.following_count}</div>
              <div className="text-xs text-[#64748B] uppercase tracking-wider">Following</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
