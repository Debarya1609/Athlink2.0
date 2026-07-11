import React from 'react';
import { PublicUser } from '@/types';
import Link from 'next/link';

interface UserCardProps {
  user: PublicUser;
}

export function UserCard({ user }: UserCardProps) {
  const getBadgeColor = (role: string) => {
    switch (role) {
      case 'athlete': return 'bg-[#2E5BFF]/10 text-[#2E5BFF]';
      case 'coach': return 'bg-[#10B981]/10 text-[#10B981]';
      case 'academy': return 'bg-[#D4AF37]/10 text-[#D4AF37]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-theme-border overflow-hidden p-5 flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow relative">
      {/* Available for Trials Badge */}
      {user.available_for_trials && (
        <div className="absolute top-3 right-3 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></div>
          <span className="ml-1.5 text-[10px] font-bold text-[#10B981] uppercase tracking-wide">Available</span>
        </div>
      )}

      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-[#F0F2F5] overflow-hidden flex-shrink-0 flex items-center justify-center mx-auto mt-2 shadow-sm border border-theme-border">
        {user.photo_url ? (
          <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-theme-slate text-2xl">{user.name.charAt(0)}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 w-full">
        <h3 className="font-bold text-[17px] text-theme-charcoal leading-tight truncate">{user.name}</h3>
        
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${getBadgeColor(user.role)}`}>
            {user.role}
          </span>
        </div>

        <div className="text-[13px] text-theme-slate mt-2 flex flex-col gap-1">
          {user.sport && (
            <div className="flex items-center justify-center gap-1.5">
              <span>🏆</span>
              <span className="truncate">{user.sport}</span>
            </div>
          )}
          {user.city && (
            <div className="flex items-center justify-center gap-1.5">
              <span>📍</span>
              <span className="truncate">{user.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-2 w-full flex gap-2">
        <button className="flex-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-theme-charcoal py-2 rounded-lg text-[13px] font-bold transition-colors">
          Follow
        </button>
        <Link href={`/profile/${user.id}`} className="flex-1 bg-black hover:bg-theme-charcoal text-white py-2 rounded-lg text-[13px] font-bold transition-colors shadow-sm block">
          View Profile
        </Link>
      </div>
    </div>
  );
}
