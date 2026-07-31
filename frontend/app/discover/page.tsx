'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockUsers } from '@/lib/mockData';
import { UserCard } from '@/components/discover/UserCard';
import { UserRole } from '@/types';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<string>('All Sports');
  const [cityFilter, setCityFilter] = useState<string>('All Cities');
  const [trialsOnly, setTrialsOnly] = useState<boolean>(false);

  // Derive filter options from mock data
  const sports = ['All Sports', ...Array.from(new Set(mockUsers.map(u => u.sport).filter((sport): sport is string => Boolean(sport))))];
  const cities = ['All Cities', ...Array.from(new Set(mockUsers.map(u => u.city).filter((city): city is string => Boolean(city))))];

  const filteredUsers = mockUsers.filter(user => {
    // Text search
    if (searchQuery && !(
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    // Filters
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (sportFilter !== 'All Sports' && user.sport !== sportFilter) return false;
    if (cityFilter !== 'All Cities' && user.city !== cityFilter) return false;
    if (trialsOnly && !user.available_for_trials) return false;

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Header and Filters Area */}
      <div className="bg-white border-b border-theme-border flex flex-col sticky top-0 z-10 shadow-sm">
        
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-theme-border/50">
          <h1 className="text-2xl font-bold text-theme-charcoal">Discover</h1>
          <p className="text-theme-slate text-sm mt-1">Find athletes, coaches, and academies near you.</p>
        </div>

        {/* Filters Toolbar */}
        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="relative w-full max-w-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-slate">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by name, sport, or city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F0F2F5] text-theme-charcoal placeholder-theme-slate rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-theme-cobalt text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex bg-[#F0F2F5] rounded-lg p-1">
              {(['all', 'athlete', 'coach', 'academy'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-bold capitalize transition-colors ${
                    roleFilter === role 
                      ? 'bg-white text-theme-charcoal shadow-sm' 
                      : 'text-theme-slate hover:text-theme-charcoal'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Sport Filter */}
            <select 
              value={sportFilter} 
              onChange={(e) => setSportFilter(e.target.value)}
              className="bg-[#F0F2F5] text-theme-charcoal text-[13px] font-semibold px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-theme-cobalt outline-none cursor-pointer"
            >
              {sports.map(sport => <option key={sport} value={sport}>{sport}</option>)}
            </select>

            {/* City Filter */}
            <select 
              value={cityFilter} 
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-[#F0F2F5] text-theme-charcoal text-[13px] font-semibold px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-theme-cobalt outline-none cursor-pointer"
            >
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>

            {/* Availability Toggle */}
            <label className="flex items-center gap-2 cursor-pointer ml-2">
              <div className={`w-10 h-5 rounded-full relative transition-colors ${trialsOnly ? 'bg-[#10B981]' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${trialsOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={trialsOnly} 
                onChange={(e) => setTrialsOnly(e.target.checked)} 
              />
              <span className="text-[13px] font-bold text-theme-charcoal">Available for Trials</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-[14px] font-semibold text-theme-slate">
            Found {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
          </div>

          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-theme-border flex flex-col items-center mt-4">
              <div className="w-16 h-16 bg-[#F0F2F5] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-theme-slate">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-bold text-theme-charcoal mb-1">No matches found</h3>
              <p className="text-[14px] text-theme-slate max-w-sm">
                We could not find any users matching your current filters. Try adjusting your search criteria or clearing some filters.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setSportFilter('All Sports');
                  setCityFilter('All Cities');
                  setTrialsOnly(false);
                }}
                className="mt-6 px-5 py-2 bg-black text-white text-[13px] font-bold rounded-lg hover:bg-theme-charcoal transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center bg-[#F8FAFC] text-sm font-semibold text-theme-slate">Loading discover...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
