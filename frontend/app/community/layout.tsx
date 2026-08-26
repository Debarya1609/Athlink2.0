import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { ChatWidget } from '../../components/layout/ChatWidget';
import { BottomNav } from '../../components/layout/BottomNav';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-white)] w-full flex justify-between">
      {/* Sidebar - Fixed Left (Desktop/Tablet) */}
      <div className="hidden md:flex w-fit transition-all duration-300 ease-in-out shrink-0 border-r border-[var(--color-gray-15)] bg-[var(--color-white)] h-screen sticky top-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area (Max width capped at 640px per blueprint) */}
      <div className="flex-1 flex flex-col min-w-0 max-w-[640px] bg-[var(--color-white)] border-r border-[var(--color-gray-15)] shadow-[0_0_40px_rgba(0,0,0,0.02)]">
        <main className="flex-1 w-full pb-20 md:pb-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Empty right placeholder to maintain center alignment */}
      <div className="hidden lg:block w-[320px] shrink-0"></div>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
