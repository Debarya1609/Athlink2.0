'use client';

import React, { Suspense } from 'react';
import { mockUsers } from '@/lib/mockData';
import Link from 'next/link';

function CuratedRow({ title, users }: { title: string, users: typeof mockUsers }) {
  if (users.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 md:px-6">
        <h2 className="font-display text-xl font-bold text-[var(--color-ink)] uppercase tracking-wide">{title}</h2>
        <button className="text-[12px] font-bold text-[var(--color-gray-60)] uppercase tracking-widest hover:text-[var(--color-ink)] transition-colors">See All</button>
      </div>
      
      <div className="flex overflow-x-auto gap-4 px-4 md:px-6 pb-4 no-scrollbar snap-x">
        {users.map(user => (
          <div key={user.id} className="snap-start shrink-0 w-[240px] border border-[var(--color-gray-15)] bg-[var(--color-white)] p-5 flex flex-col items-center text-center relative group hover:border-[var(--color-ink)] transition-colors">
            
            {/* Availability Dot */}
            {user.available_for_trials && (
              <div className="absolute top-4 right-4 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[image:var(--image-gold-shine)]"></div>
              </div>
            )}

            {/* Avatar */}
            <div className="w-20 h-20 rounded-full border border-[var(--color-gray-15)] bg-[var(--color-paper)] overflow-hidden flex items-center justify-center mb-3">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-[var(--color-gray-40)] text-2xl">{user.name.charAt(0)}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 w-full mb-4">
              <h3 className="font-display font-extrabold text-[18px] text-[var(--color-ink)] leading-tight truncate uppercase tracking-wide">{user.name}</h3>
              
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-[var(--color-ink)] text-[var(--color-ink)]`}>
                  {user.role}
                </span>
              </div>

              <div className="text-[12px] text-[var(--color-gray-60)] font-mono mt-2 flex flex-col gap-1">
                {user.sport && (
                  <div className="truncate text-center">SPRT: {user.sport}</div>
                )}
                {user.city && (
                  <div className="truncate text-center">LOC: {user.city}</div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto w-full pt-4 border-t border-[var(--color-gray-15)]">
              <Link href={`/profile/${user.id}`} className="block w-full py-2 bg-[var(--color-ink)] text-[var(--color-white)] text-[12px] font-bold uppercase tracking-widest text-center hover:bg-[var(--color-gray-60)] transition-colors">
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscoverContent() {
  const topProspects = mockUsers.filter(u => u.role === 'athlete').slice(0, 6);
  const eliteAcademies = mockUsers.filter(u => u.role === 'academy').slice(0, 6);
  const availableForTrials = mockUsers.filter(u => u.available_for_trials).slice(0, 6);
  const topCoaches = mockUsers.filter(u => u.role === 'coach').slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] md:bg-[var(--color-white)]">
      {/* Header */}
      <div className="px-4 md:px-6 py-6 border-b border-[var(--color-gray-15)] bg-[var(--color-white)] mb-6">
        <h1 className="font-display text-3xl font-extrabold text-[var(--color-ink)] uppercase tracking-wide">Explore</h1>
        <p className="text-[var(--color-gray-60)] text-[13px] font-mono mt-1 uppercase">Discover athletes, coaches, and organizations</p>
      </div>

      {/* Curated Rows */}
      <div className="flex flex-col">
        <CuratedRow title="Top Prospects" users={topProspects} />
        <div className="lane-line mb-10 mx-4 md:mx-6" />
        
        <CuratedRow title="Elite Academies" users={eliteAcademies} />
        <div className="lane-line mb-10 mx-4 md:mx-6" />
        
        <CuratedRow title="Available for Trials" users={availableForTrials} />
        <div className="lane-line mb-10 mx-4 md:mx-6" />
        
        <CuratedRow title="Top Coaches" users={topCoaches} />
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[var(--color-paper)] font-mono text-[var(--color-gray-60)] uppercase">Loading...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
