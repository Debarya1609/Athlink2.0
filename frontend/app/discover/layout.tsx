import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { ChatWidget } from '../../components/layout/ChatWidget';

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar - Fixed Left */}
      <div className="hidden md:block w-[260px] shrink-0 border-r border-theme-border bg-white h-screen sticky top-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 w-full max-w-full pb-20 overflow-x-hidden">
          {children}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
