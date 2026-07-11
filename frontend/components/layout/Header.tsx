'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { mockUsers, mockNotifications } from '@/lib/mockData';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const filteredUsers = mockUsers.filter(user => 
    searchQuery && 
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.city?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-theme-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl" ref={searchRef}>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-slate">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search Athletes, Organizations, Listings..." 
            className="w-full bg-[#F0F2F5] text-theme-charcoal placeholder-theme-slate rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-theme-border text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          
          {/* Search Dropdown Overlay */}
          {showDropdown && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-theme-border overflow-hidden z-50">
              {filteredUsers.length > 0 ? (
                <div className="flex flex-col">
                  {filteredUsers.map(user => (
                    <Link 
                      key={user.id} 
                      href={`/profile/${user.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 p-3 hover:bg-[#F8FAFC] transition-colors border-b border-theme-border/50 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F0F2F5] flex-shrink-0 flex items-center justify-center font-bold text-theme-slate overflow-hidden">
                        {user.photo_url ? (
                          <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[14px] text-theme-charcoal truncate">{user.name}</div>
                        <div className="text-[12px] text-theme-slate truncate capitalize">
                          {user.role} • {user.sport} {user.city ? `• ${user.city}` : ''}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href={`/discover?q=${searchQuery}`} className="block p-3 text-center text-[13px] font-bold text-theme-cobalt hover:bg-[#F0F2F5] transition-colors">
                    View all results for "{searchQuery}"
                  </Link>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-theme-slate">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notifications Icon with Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`transition-colors relative ${showNotifications ? 'text-theme-cobalt' : 'text-theme-slate hover:text-theme-charcoal'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {/* Unread badge */}
            {mockNotifications.some(n => !n.read) && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-theme-coral rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-theme-border overflow-hidden z-50">
              <div className="p-3 border-b border-theme-border flex justify-between items-center bg-[#F8FAFC]">
                <h3 className="font-bold text-[15px] text-theme-charcoal">Notifications</h3>
                <button className="text-[12px] font-semibold text-theme-cobalt hover:underline">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.length > 0 ? (
                  <div className="flex flex-col">
                    {mockNotifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-theme-border/50 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${!notification.read ? 'bg-[#F0F2F5]/50' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full flex-shrink-0">
                            {!notification.read && <div className="w-full h-full bg-theme-cobalt rounded-full"></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-theme-charcoal leading-snug">{notification.message}</p>
                            <p className="text-[11px] text-theme-slate mt-1 font-medium">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-[13px] text-theme-slate">
                    You have no new notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-[#F0F2F5] border border-theme-border flex items-center justify-center font-bold text-sm text-theme-charcoal ml-2 cursor-pointer">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full rounded-full object-cover" />
        </div>
      </div>
    </header>
  );
}
