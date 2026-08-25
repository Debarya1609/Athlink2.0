'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export function Sidebar() {
  const { currentUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  React.useEffect(() => {
    const saved = localStorage.getItem('athlink_sidebar_expanded');
    if (saved !== null) setIsExpanded(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    localStorage.setItem('athlink_sidebar_expanded', String(nextState));
  };

  const navItems = [
    { 
      name: 'Home', 
      href: '/feed',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    { 
      name: 'Discover', 
      href: '/discover',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
        </svg>
      )
    },
    { 
      name: 'Messages', 
      href: '/messages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      )
    },
    { 
      name: 'Community', 
      href: '/community',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    }
  ];

  const joinedCommunities = [
    { name: 'Global Runners', slug: 'global-runners' },
    { name: 'Pro Cyclists Hub', slug: 'pro-cyclists-hub' },
  ];

  return (
    <aside className={`relative flex flex-col h-full bg-[var(--color-white)] transition-all duration-300 ease-in-out ${isExpanded ? 'w-[260px]' : 'w-[80px]'}`}>
      
      {/* Floating Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-[15px] top-6 w-[30px] h-[30px] bg-white border border-[var(--color-gray-15)] rounded-full flex items-center justify-center text-[var(--color-ink)] shadow-sm hover:shadow-md transition-all z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Top Section: Logo */}
      <div className={`flex items-center h-20 px-4 border-b border-transparent ${!isExpanded && 'justify-center'}`}>
        {isExpanded ? (
          <Link href="/feed" className="block mx-auto overflow-hidden">
            <img src="/Athlink-logo (0001).jpg" alt="Athlink Logo" className="h-14 w-auto object-contain scale-110 origin-left" />
          </Link>
        ) : (
          <Link href="/feed" className="block">
            <img src="/Athlink-logo (0001).jpg" alt="Athlink Logo" className="h-10 w-auto object-contain" />
          </Link>
        )}
      </div>

      <div className="flex flex-col overflow-y-auto flex-1 no-scrollbar py-4 gap-2">
        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg text-[var(--color-ink)] transition-colors duration-200 hover:bg-[var(--color-paper)] ${
                isExpanded ? 'px-4 py-3' : 'justify-center p-3 w-12 h-12 mx-auto'
              }`}
              title={!isExpanded ? item.name : undefined}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isExpanded && <span className="ml-4 font-display font-bold uppercase tracking-widest text-[14px] whitespace-nowrap">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Create Post Button */}
        <div className="px-4 mt-2">
          {isExpanded ? (
            <button className="w-full bg-[var(--color-ink)] text-[var(--color-white)] font-display font-bold uppercase tracking-widest text-[12px] py-3 rounded-lg hover:bg-[var(--color-gray-60)] transition-colors shadow-sm">
              Create Post
            </button>
          ) : (
            <button className="w-12 h-12 mx-auto bg-[var(--color-ink)] text-[var(--color-white)] rounded-lg hover:bg-[var(--color-gray-60)] transition-colors flex items-center justify-center shadow-sm" title="Create Post">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>

        {/* Expandable Community Section */}
        {isExpanded && (
          <div className="mt-6 px-7">
            <h3 className="font-mono text-[11px] font-bold text-[var(--color-gray-40)] uppercase tracking-widest mb-3">Joined Communities</h3>
            <div className="flex flex-col gap-3">
              {joinedCommunities.map(c => (
                <Link key={c.slug} href={`/community/${c.slug}`} className="text-[13px] font-bold text-[var(--color-gray-60)] hover:text-[var(--color-ink)] transition-colors truncate">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Profile */}
      <div className="mt-auto p-4 border-t border-[var(--color-gray-15)]">
        <Link href="/profile" className={`flex items-center gap-3 rounded-lg hover:bg-[var(--color-paper)] transition-colors ${isExpanded ? 'p-2' : 'p-2 justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-[var(--color-paper)] flex items-center justify-center text-[var(--color-ink)] font-display font-bold border border-[var(--color-gray-15)] shadow-sm overflow-hidden flex-shrink-0">
            {currentUser?.photo_url ? (
              <img src={currentUser.photo_url} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser?.name?.charAt(0) || 'U'
            )}
          </div>
          {isExpanded && (
            <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
              <span className="text-[14px] font-display font-bold uppercase tracking-wide text-[var(--color-ink)] truncate w-full">{currentUser?.name || 'Guest'}</span>
              <span className="text-[10px] font-mono text-[var(--color-gray-60)] uppercase tracking-widest truncate w-full">{currentUser?.role || 'User'}</span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
