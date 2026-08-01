import React from 'react';

const SUGGESTED_ORGS = [
  { name: 'Nike Running Club', type: 'Pro Runner', logo: 'N' },
  { name: 'Adidas Runners', type: 'Pro Runner', logo: 'A' },
  { name: 'Warkmutssart C...', type: 'Pro Runner', logo: 'W' },
  { name: 'Rinitons Runners', type: 'Pro Runner', logo: 'R' },
];

const TRENDING_LISTINGS = [
  { title: '10k Marathon Sponsorship', subtitle: '10k Marathon Sponsorship' },
  { title: 'Pro Soccer Tryouts', subtitle: '10 + Soccer Sponsorship' },
  { title: 'Pro Soccer Opportuniti...', subtitle: '10k Soccer Prantting' },
];

export function RightSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="hidden xl:flex flex-col w-[340px] shrink-0 gap-6">
      
      {children}

      {/* Suggested Organizations */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
        <h2 className="text-[16px] font-bold text-theme-charcoal mb-5">Suggested Organizations</h2>
        <div className="flex flex-col gap-5">
          {SUGGESTED_ORGS.map((org, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg overflow-hidden border border-theme-border">
                  {org.logo}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-theme-charcoal leading-tight">{org.name}</span>
                  <span className="text-[13px] text-theme-cerulean mt-0.5">{org.type}</span>
                </div>
              </div>
              <button className="bg-theme-teal text-white text-[13px] font-semibold px-4 py-1.5 rounded-full hover:bg-opacity-90 transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Listings */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
        <h2 className="text-[16px] font-bold text-theme-charcoal mb-5">Trending Listings</h2>
        <div className="flex flex-col gap-6">
          {TRENDING_LISTINGS.map((listing, idx) => (
            <div key={idx} className="flex flex-col gap-1 border-b border-theme-border pb-4 last:border-0 last:pb-0">
              <span className="text-[14px] font-semibold text-theme-charcoal leading-tight">{listing.title}</span>
              <span className="text-[13px] text-theme-cerulean">{listing.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
