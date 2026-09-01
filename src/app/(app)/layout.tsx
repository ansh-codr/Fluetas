'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0B0D14] text-[#E8EAF6] antialiased">
      {/* Sidebar (Mobile drawer / Tablet rail / Desktop fixed) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[68px] lg:ml-[220px] transition-all duration-300">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-16 flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-28 md:pb-32 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
