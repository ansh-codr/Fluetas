'use client';

import React, { useState } from 'react';
import { Bell, Calendar, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockUser } from '@/lib/mock/dashboardData';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { user } = useAuth();
  const displayName = user?.displayName ?? mockUser.name;
  const firstName = displayName.split(' ')[0];
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="h-16 fixed top-0 left-0 md:left-[68px] lg:left-[220px] right-0 bg-[#0B0D14]/90 backdrop-blur-md border-b border-[#1E2133] flex items-center px-3 sm:px-6 gap-3 sm:gap-4 z-40 transition-all duration-300">
      {/* Mobile Hamburger Button */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg bg-[#13161F] border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] md:hidden shrink-0 cursor-pointer"
        aria-label="Toggle menu"
      >
        <Menu size={18} />
      </button>

      {/* Greeting Title */}
      <div className="flex-1 min-w-0">
        <h2 className="font-['Outfit'] text-sm sm:text-base lg:text-lg font-bold text-[#E8EAF6] m-0 truncate">
          {getGreeting()}, {firstName}! 👋
        </h2>
        <p className="text-[#8B91B0] text-[0.65rem] sm:text-xs m-0 truncate hidden sm:block">
          Here&apos;s your FLUETAS health & wellness overview for today.
        </p>
      </div>

      {/* Desktop & Tablet Search Bar */}
      <div className="hidden sm:flex items-center gap-2 bg-[#13161F] border border-[#1E2133] rounded-lg px-3 py-1.5 min-w-[180px] lg:min-w-[260px]">
        <Search size={14} className="text-[#3A3F58] shrink-0" />
        <input
          id="topbar-search"
          placeholder="Search logs, vitals, experts..."
          className="bg-transparent border-none outline-none text-[#8B91B0] text-xs flex-1 min-w-0"
        />
      </div>

      {/* Mobile Search Trigger */}
      <button
        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
        className="sm:hidden p-2 rounded-lg bg-[#13161F] border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] shrink-0 cursor-pointer"
        aria-label="Search"
      >
        <Search size={16} />
      </button>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Notifications */}
        <button
          id="topbar-notifications-btn"
          className="relative w-9 h-9 rounded-lg bg-[#13161F] border border-[#1E2133] flex items-center justify-center text-[#8B91B0] hover:text-[#E8EAF6] hover:border-[#2A3050] transition-colors cursor-pointer shrink-0"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981] border-2 border-[#0B0D14]" />
        </button>

        {/* Calendar */}
        <button
          id="topbar-calendar-btn"
          className="w-9 h-9 rounded-lg bg-[#13161F] border border-[#1E2133] flex items-center justify-center text-[#8B91B0] hover:text-[#E8EAF6] hover:border-[#2A3050] transition-colors cursor-pointer shrink-0 hidden xs:flex"
          aria-label="Calendar"
        >
          <Calendar size={16} />
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-[#13161F] border border-[#1E2133] rounded-xl px-2.5 py-1.5 cursor-pointer shrink-0 hover:border-[#2A3050] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            {firstName[0]}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[#E8EAF6] text-xs font-semibold m-0 leading-tight truncate max-w-[100px] lg:max-w-[130px]">
              {displayName}
            </p>
            <p className="text-[#FBBF24] text-[0.62rem] font-medium m-0 flex items-center gap-1">
              <span>Premium</span> ⭐
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Drawer / Overlay */}
      {mobileSearchOpen && (
        <div className="absolute top-16 left-0 right-0 p-3 bg-[#0D0F18] border-b border-[#1E2133] shadow-2xl flex items-center gap-2 sm:hidden animate-slide-up">
          <div className="flex-1 flex items-center gap-2 bg-[#13161F] border border-[#1E2133] rounded-lg px-3 py-2">
            <Search size={14} className="text-[#3A3F58]" />
            <input
              autoFocus
              placeholder="Search anything..."
              className="bg-transparent border-none outline-none text-[#E8EAF6] text-xs flex-1"
            />
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-[#8B91B0] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
