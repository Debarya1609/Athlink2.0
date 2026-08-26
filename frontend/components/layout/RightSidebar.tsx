import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export function RightSidebar({ children }: { children?: React.ReactNode }) {
  const [suggestedOrgs, setSuggestedOrgs] = useState<any[]>([]);
  const [trendingListings, setTrendingListings] = useState<any[]>([]);

  useEffect(() => {
    // Real-time logic implementation placeholder
    const fetchData = async () => {
      try {
        const [orgsRes, listingsRes] = await Promise.all([
          api.get('/organizations/suggested').catch(() => ({ data: [] })),
          api.get('/listings/trending').catch(() => ({ data: [] }))
        ]);
        setSuggestedOrgs(orgsRes.data || []);
        setTrendingListings(listingsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch sidebar data', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-[var(--color-white)]">
      
      {children}

      {/* Suggested Organizations */}
      <div className="p-6">
        <h2 className="font-display text-[16px] font-bold text-[var(--color-ink)] uppercase tracking-wide mb-5">Suggested Organizations</h2>
        <div className="flex flex-col gap-5">
          {suggestedOrgs.map((org, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-ink)] text-[var(--color-white)] rounded-full flex items-center justify-center font-display font-bold text-lg overflow-hidden border border-[var(--color-gray-15)]">
                  {org.logo}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-display font-bold text-[var(--color-ink)] uppercase tracking-wide leading-tight truncate">{org.name}</span>
                  <span className="text-[10px] font-mono text-[var(--color-gray-60)] uppercase tracking-widest mt-0.5 truncate">{org.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lane-line"></div>

      {/* Trending Listings */}
      <div className="p-6">
        <h2 className="font-display text-[16px] font-bold text-[var(--color-ink)] uppercase tracking-wide mb-5">Trending Listings</h2>
        <div className="flex flex-col gap-6">
          {trendingListings.map((listing, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span className="text-[14px] font-display font-bold text-[var(--color-ink)] uppercase tracking-wide leading-tight">{listing.title}</span>
              <span className="text-[10px] font-mono text-[var(--color-gray-60)] uppercase tracking-widest">{listing.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
