import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent flex">
      <div className="hidden md:flex w-fit transition-all duration-300 ease-in-out shrink-0 border-r border-[var(--color-gray-15)] bg-white h-screen sticky top-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 w-full max-w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
