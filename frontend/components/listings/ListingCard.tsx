'use client';

import React, { useState } from 'react';
import { Listing } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { currentUser } = useAuth();
  const [applied, setApplied] = useState(false);

  const canApply = () => {
    if (!currentUser) return false;
    if (currentUser.id === listing.posted_by.id) return false;
    if (listing.type === 'trial' && currentUser.role !== 'athlete') return false;
    if (listing.type === 'job' && currentUser.role !== 'coach') return false;
    if (listing.type === 'tournament' && currentUser.role === 'academy') return false;
    return true;
  };

  const handleApply = () => {
    if (!canApply() || applied) return;
    setApplied(true);
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'trial': return 'bg-[#2E5BFF]/10 text-[#2E5BFF]';
      case 'job': return 'bg-[#10B981]/10 text-[#10B981]';
      case 'tournament': return 'bg-[#D4AF37]/10 text-[#D4AF37]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-theme-border overflow-hidden p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#F0F2F5] overflow-hidden flex-shrink-0 flex items-center justify-center">
            {listing.posted_by.photo_url ? (
              <img src={listing.posted_by.photo_url} alt={listing.posted_by.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-theme-slate text-lg">{listing.posted_by.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-[16px] text-theme-charcoal leading-tight">{listing.title}</h3>
            <Link href={`/profile/${listing.posted_by.id}`} className="text-[13px] text-theme-slate hover:text-theme-cobalt transition-colors font-medium">
              {listing.posted_by.name}
            </Link>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${getBadgeColor(listing.type)}`}>
          {listing.type}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-[13px]">
        {listing.date && (
          <div className="flex items-center gap-2 text-theme-slate">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-theme-charcoal">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="truncate">{new Date(listing.date).toLocaleDateString()}</span>
          </div>
        )}
        {(listing.location || listing.city) && (
          <div className="flex items-center gap-2 text-theme-slate">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-theme-charcoal">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="truncate">{listing.location}{listing.location && listing.city ? ', ' : ''}{listing.city}</span>
          </div>
        )}
        {listing.sport && (
          <div className="flex items-center gap-2 text-theme-slate">
            <span className="w-4 h-4 flex items-center justify-center font-bold text-theme-charcoal">🏆</span>
            <span className="truncate">{listing.sport}</span>
          </div>
        )}
        {listing.age_group && (
          <div className="flex items-center gap-2 text-theme-slate">
            <span className="w-4 h-4 flex items-center justify-center font-bold text-theme-charcoal">👥</span>
            <span className="truncate">{listing.age_group}</span>
          </div>
        )}
        {listing.experience_required && (
          <div className="flex items-center gap-2 text-theme-slate">
            <span className="w-4 h-4 flex items-center justify-center font-bold text-theme-charcoal">💼</span>
            <span className="truncate">{listing.experience_required}</span>
          </div>
        )}
      </div>

      {listing.description && (
        <p className="text-[13px] text-theme-slate line-clamp-2 leading-relaxed">
          {listing.description}
        </p>
      )}

      {/* Footer / CTA */}
      <div className="mt-2 pt-4 border-t border-theme-border flex items-center justify-between">
        <span className="text-[12px] text-theme-slate">
          Posted {new Date(listing.created_at).toLocaleDateString()}
        </span>
        
        {canApply() ? (
          <button 
            onClick={handleApply}
            disabled={applied}
            className={`px-6 py-2 rounded-lg font-bold text-[13px] transition-all duration-300 ${
              applied 
                ? 'bg-[#10B981]/10 text-[#10B981] cursor-default' 
                : 'bg-black text-white hover:bg-theme-charcoal shadow-sm hover:shadow-md'
            }`}
          >
            {applied ? 'Applied ✓' : 'Apply Now'}
          </button>
        ) : (
          <div className="px-4 py-2 rounded-lg bg-[#F0F2F5] text-theme-slate text-[12px] font-semibold">
            {currentUser?.id === listing.posted_by.id ? 'Your Listing' : 'Not Eligible'}
          </div>
        )}
      </div>
    </div>
  );
}
