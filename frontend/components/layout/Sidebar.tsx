'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export function Sidebar() {
  const { currentUser } = useAuth();
  const navItems = [
    { 
      name: 'Home', 
      href: '/feed', 
      active: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    { 
      name: 'Discover', 
      href: '/discover', 
      active: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
        </svg>
      )
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      active: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      )
    },
    { 
      name: 'Community', 
      href: '/community', 
      active: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      active: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    },
  ];

  return (
    <aside className="flex flex-col h-full bg-white w-full">
      {/* Top: Logo */}
      <div className="flex h-16 items-center px-6 border-b border-transparent">
        <Link href="/feed" className="block">
          <img src="/Athlink-logo (0001).jpg" alt="Athlink Logo" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto flex-1 no-scrollbar pb-6 pt-4">
        {/* Create Post Action */}
        <div className="px-4 mb-8">
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold py-3.5 rounded-xl hover:bg-theme-charcoal transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Post
          </button>
        </div>

        {/* Profile Summary (Top Sidebar) */}
        <div className="flex flex-col items-center px-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#F0F2F5] border border-theme-border mb-3 overflow-hidden shadow-sm flex items-center justify-center text-3xl font-bold text-gray-400">
            {currentUser?.photo_url ? (
              <img src={currentUser.photo_url} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser?.name?.charAt(0) || 'U'
            )}
          </div>
          <h2 className="text-[17px] font-semibold text-theme-charcoal">{currentUser?.name || 'Guest User'}</h2>
          <p className="text-[14px] text-theme-slate mb-1 capitalize">{currentUser?.role || 'User'}</p>
          <p className="text-[13px] text-theme-slate font-medium">{currentUser?.followers_count || 0} Connections</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-200 ${
                item.active 
                  ? 'bg-[#2E5BFF]/10 text-theme-cobalt border-l-4 border-theme-cobalt relative -ml-[1px] pl-[13px] rounded-l-none' 
                  : 'text-theme-slate hover:bg-[#F0F2F5] hover:text-theme-charcoal border-l-4 border-transparent pl-[13px] rounded-l-none'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom: Profile Auth Link */}
      <div className="mt-auto p-4 border-t border-theme-border bg-white">
        <Link href="/profile" className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-[#F0F2F5] transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#F0F2F5] flex items-center justify-center text-theme-charcoal font-semibold border border-theme-border shadow-sm overflow-hidden">
            {currentUser?.photo_url ? (
              <img src={currentUser.photo_url} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="text-[14px] font-semibold text-theme-charcoal truncate w-full">{currentUser?.name || 'Guest User'}</span>
            <span className="text-[12px] text-theme-slate capitalize truncate w-full">{currentUser?.role || 'User'}</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
