import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { ChatWidget } from '../../components/layout/ChatWidget';
import { BottomNav } from '../../components/layout/BottomNav';
import { RightSidebar } from '../../components/layout/RightSidebar';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] md:bg-[var(--color-white)] flex justify-center">
      {/* Sidebar - Fixed Left (Desktop/Tablet) */}
      <div className="hidden md:flex w-[80px] lg:w-[260px] shrink-0 border-r border-[var(--color-gray-15)] bg-[var(--color-white)] h-screen sticky top-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area (Max width capped at 640px per blueprint) */}
      <div className="flex-1 flex flex-col min-w-0 max-w-[640px] bg-[var(--color-white)] border-r border-[var(--color-gray-15)] shadow-[0_0_40px_rgba(0,0,0,0.02)]">
        <Header />
        <main className="flex-1 w-full pb-20 md:pb-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Right Rail (Desktop Only - 320px) */}
      <div className="hidden lg:block w-[320px] shrink-0 bg-[var(--color-paper)] h-screen sticky top-0 border-l border-[var(--color-gray-15)]">
        <RightSidebar />
      </div>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
