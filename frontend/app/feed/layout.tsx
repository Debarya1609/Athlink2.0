import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { ChatWidget } from '../../components/layout/ChatWidget';
import { BottomNav } from '../../components/layout/BottomNav';

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] md:bg-[var(--color-white)] flex justify-center">
      {/* Sidebar - Fixed Left (Desktop/Tablet) */}
      <div className="hidden md:flex w-[80px] lg:w-[260px] shrink-0 border-r border-[var(--color-gray-15)] bg-[var(--color-white)] h-screen sticky top-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area (Max width capped at 640px per blueprint) */}
      <div className="flex-1 flex flex-col min-w-0 max-w-[640px] bg-[var(--color-white)] border-r border-[var(--color-gray-15)]">
        <Header />
        <main className="flex-1 w-full pb-20 md:pb-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Right Rail (Desktop Only - 320px) */}
      <div className="hidden lg:block w-[320px] shrink-0 bg-[var(--color-white)] h-screen sticky top-0 p-6">
        {/* Suggested / trending placeholder for right rail */}
      </div>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
