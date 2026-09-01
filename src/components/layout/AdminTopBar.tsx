'use client';

import React from 'react';
import { Menu, Search, ShieldAlert, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminTopBarProps {
  onMenuToggle: () => void;
}

export default function AdminTopBar({ onMenuToggle }: AdminTopBarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 fixed top-0 left-0 md:left-[68px] lg:left-[220px] right-0 bg-[#0B0D14]/90 backdrop-blur-md border-b border-[#1E2133] flex items-center px-3 sm:px-6 gap-3 sm:gap-4 z-40 transition-all duration-300">
      {/* Mobile Hamburger */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg bg-[#13161F] border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] md:hidden shrink-0 cursor-pointer"
        aria-label="Toggle menu"
      >
        <Menu size={18} />
      </button>

      {/* Title & Portal Badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#E8EAF6] m-0 truncate">
            Platform Administration
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 hidden xs:inline">
            Superadmin Operations
          </span>
        </div>
        <p className="text-[#8B91B0] text-[0.65rem] sm:text-xs m-0 truncate hidden sm:block">
          System telemetry, doctor verifications, user accounts, and immutable compliance audit logs.
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="flex items-center gap-2 bg-[#13161F] border border-[#1E2133] rounded-xl px-2.5 py-1.5 shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-xs font-bold text-black shrink-0">
            Adm
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[#E8EAF6] text-xs font-semibold m-0 leading-tight truncate max-w-[120px]">
              {user?.displayName || 'Admin Console'}
            </p>
            <p className="text-[#F59E0B] text-[0.6rem] font-bold m-0">
              Root Level Access
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
