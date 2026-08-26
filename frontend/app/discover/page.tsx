'use client';

import React, { useState, useEffect } from 'react';
import { FeedPost } from '../../components/feed/FeedPost';
import { mockUsers } from '@/lib/mockData';
import Link from 'next/link';
import api from '@/lib/api';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [locationConsent, setLocationConsent] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [posts, setPosts] = useState<any[]>([]);

  // Instant Search Dropdown
  const dropdownResults = searchQuery.startsWith('@') 
    ? mockUsers.filter(u => u.name.toLowerCase().includes(searchQuery.slice(1).toLowerCase()))
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
      setIsDropdownOpen(false);
    }
  };

  // Fetch mock posts for the discover feed
  useEffect(() => {
    api.get('/feed')
      .then(res => setPosts(res.data.data || []))
      .catch(console.error);
  }, []);

  const handleLocationRequest = () => {
    // Mock location request
    if (confirm("Athlink would like to use your location to find nearby athletes, coaches, and turfs.")) {
      setLocationConsent(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-white)] w-full">
      {/* Search Header */}
      <div className="p-4 md:p-6 border-b border-[var(--color-gray-15)]">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="flex items-center bg-[var(--color-paper)] border border-[var(--color-gray-15)] rounded-full px-4 py-3 focus-within:border-[var(--color-ink)] transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[var(--color-gray-40)] mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search @username..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
                setHasSearched(false);
              }}
              className="flex-1 bg-transparent outline-none text-[15px] font-medium text-[var(--color-ink)] placeholder-[var(--color-gray-40)]"
            />
          </div>

          {/* Instant Dropdown */}
          {isDropdownOpen && searchQuery.startsWith('@') && dropdownResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[var(--color-gray-15)] shadow-xl z-50 rounded-lg overflow-hidden">
              {dropdownResults.slice(0, 5).map(user => (
                <div key={user.id} onClick={() => { setSearchQuery('@' + user.name); setIsDropdownOpen(false); setHasSearched(true); }} className="flex items-center gap-3 p-3 hover:bg-[var(--color-paper)] cursor-pointer border-b border-[var(--color-gray-15)] last:border-b-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-gray-15)] flex items-center justify-center overflow-hidden">
                    {user.photo_url ? <img src={user.photo_url} alt={user.name} /> : <span className="font-bold text-[var(--color-ink)]">{user.name.charAt(0)}</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[14px] text-[var(--color-ink)]">{user.name}</span>
                    <span className="text-[11px] uppercase tracking-widest font-mono text-[var(--color-gray-60)]">{user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Funnel Filters */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Turfs', 'Coaches', 'Athletes', 'Announcements', 'Trials'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border ${
                activeFilter === filter 
                  ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' 
                  : 'bg-transparent text-[var(--color-gray-60)] border-[var(--color-gray-15)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Location Sharing Prompt */}
        {!locationConsent && (
          <div className="mt-4 bg-[var(--color-paper)] border border-[var(--color-gray-15)] p-3 rounded flex justify-between items-center">
            <span className="text-[12px] text-[var(--color-ink)] font-medium">Find nearby {activeFilter !== 'All' ? activeFilter.toLowerCase() : 'places and people'}</span>
            <button onClick={handleLocationRequest} className="text-[10px] font-bold uppercase tracking-widest border border-[var(--color-ink)] px-3 py-1 text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white transition-colors">
              Enable Location
            </button>
          </div>
        )}
      </div>

      {/* Main Discover Content */}
      <div className="flex-1 w-full bg-[var(--color-white)]">
        {hasSearched ? (
          /* Search Results (Compact Card Format) */
          <div className="p-4 md:p-6 grid grid-cols-1 xs:grid-cols-2 gap-4">
            <h3 className="col-span-full font-display font-bold uppercase tracking-widest text-[12px] text-[var(--color-gray-60)] mb-2">Search Results for {searchQuery}</h3>
            {dropdownResults.length > 0 ? dropdownResults.map(user => (
              <Link href={`/profile/${user.id}`} key={user.id} className="border border-[var(--color-gray-15)] p-4 flex flex-col items-center text-center hover:border-[var(--color-ink)] transition-colors">
                <div className="w-16 h-16 rounded-full bg-[var(--color-gray-15)] mb-3 overflow-hidden">
                  {user.photo_url ? <img src={user.photo_url} alt={user.name} /> : null}
                </div>
                <h4 className="font-bold text-[14px] uppercase tracking-wide">{user.name}</h4>
                <span className="text-[10px] text-[var(--color-gray-60)] uppercase tracking-widest mt-1">{user.role}</span>
              </Link>
            )) : (
              <div className="col-span-full py-10 text-center text-[var(--color-gray-40)] font-mono uppercase tracking-widest text-[12px]">No users found</div>
            )}
          </div>
        ) : (
          /* Default Discover Feed */
          <div className="flex flex-col w-full">
            {posts.map(post => (
              <FeedPost 
                key={post.id}
                id={post.id}
                name={post.author?.name || 'Unknown User'}
                avatar={post.author?.photo_url || ''}
                roleBadge={post.author?.role || 'User'}
                timestamp={new Date(post.created_at).toLocaleDateString()}
                content={post.content}
                image={post.media_url || undefined}
                likes={post.stats.likes_count}
                comments={post.stats.comments_count}
                hasLiked={post.stats.liked_by_me}
                onInteraction={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
