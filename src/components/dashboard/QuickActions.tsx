'use client';

import React from 'react';
import Link from 'next/link';
import { mockQuickActions } from '@/lib/mock/dashboardData';

export default function QuickActions() {
  return (
    <div
      id="quick-actions-bar"
      className="fixed bottom-0 left-0 md:left-[68px] lg:left-[220px] right-0 bg-[#0B0D14]/95 backdrop-blur-md border-t border-[#1E2133] py-2 px-3 sm:px-6 z-30 transition-all duration-300 shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 max-w-[1600px] mx-auto">
        <span className="text-[0.68rem] font-bold text-[#8B91B0] uppercase tracking-wider shrink-0 hidden lg:inline mr-1">
          Quick Actions:
        </span>
        {mockQuickActions.map(action => (
          <Link
            key={action.id}
            href={action.href}
            id={`quick-action-${action.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#13161F] border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] hover:bg-[#181B26] hover:border-[#2A3050] text-xs font-medium no-underline shrink-0 transition-all active:scale-95"
          >
            <span className="text-sm">{action.emoji}</span>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
