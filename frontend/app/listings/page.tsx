'use client';

import React, { useState } from 'react';
import { mockListings } from '@/lib/mockData';
import { ListingType } from '@/types';
import { ListingCard } from '@/components/listings/ListingCard';

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState<ListingType>('trial');
  const [sportFilter, setSportFilter] = useState<string>('All Sports');
  const [cityFilter, setCityFilter] = useState<string>('All Cities');

  // Derive unique sports and cities from mock data
  const sports = ['All Sports', ...Array.from(new Set(mockListings.map(l => l.sport).filter(Boolean)))];
  const cities = ['All Cities', ...Array.from(new Set(mockListings.map(l => l.city).filter(Boolean)))];

  const filteredListings = mockListings.filter(listing => {
    if (listing.type !== activeTab) return false;
    if (sportFilter !== 'All Sports' && listing.sport !== sportFilter) return false;
    if (cityFilter !== 'All Cities' && listing.city !== cityFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Header Area */}
      <div className="bg-white border-b border-theme-border px-6 pt-6 pb-0 flex flex-col gap-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-theme-charcoal">Listings</h1>
          <button className="bg-black text-white px-5 py-2 rounded-xl font-bold text-[14px] hover:bg-theme-charcoal transition-colors shadow-sm">
            Create Listing
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select 
            value={sportFilter} 
            onChange={(e) => setSportFilter(e.target.value)}
            className="bg-[#F0F2F5] text-theme-charcoal text-[13px] font-semibold px-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-theme-cobalt outline-none cursor-pointer"
          >
            {sports.map(sport => <option key={sport} value={sport}>{sport}</option>)}
          </select>

          <select 
            value={cityFilter} 
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-[#F0F2F5] text-theme-charcoal text-[13px] font-semibold px-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-theme-cobalt outline-none cursor-pointer"
          >
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-8">
          {(['trial', 'job', 'tournament'] as ListingType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[15px] font-bold capitalize transition-colors relative ${
                activeTab === tab 
                  ? 'text-[#2E5BFF]' 
                  : 'text-theme-slate hover:text-theme-charcoal'
              }`}
            >
              {tab}s
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2E5BFF] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          {filteredListings.length > 0 ? (
            filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-theme-border flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F0F2F5] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-theme-slate">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-bold text-theme-charcoal mb-1">No {activeTab}s found</h3>
              <p className="text-[14px] text-theme-slate max-w-sm">
                There are currently no {activeTab}s available matching your filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
