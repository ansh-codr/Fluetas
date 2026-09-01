'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { X } from 'lucide-react';

const navItems = [
  { href: '/dashboard',      label: 'Dashboard',         emoji: '🏠' },
  { href: '/profile',        label: 'My Profile',        emoji: '👤' },
  { href: '/health-record',  label: 'Health Record',     emoji: '📋' },
  { href: '/timeline',       label: 'Timeline',          emoji: '📅' },
  { href: '/fluetas-train',  label: 'FLUETAS Train',     emoji: '🎯' },
  { href: '/exercises',      label: 'Exercise Videos',   emoji: '🎬' },
  { href: '/workouts',       label: 'Workouts',          emoji: '🏋️' },
  { href: '/nutrition',      label: 'Nutrition',         emoji: '🥗' },
  { href: '/hydration',      label: 'Hydration',         emoji: '💧' },
  { href: '/sleep',          label: 'Sleep',             emoji: '🌙' },
  { href: '/fluetas-her',    label: 'FLUETAS HER',       emoji: '♀️' },
  { href: '/cycle-tracker',  label: 'Cycle Tracker',     emoji: '🩸' },
  { href: '/symptoms',       label: 'Symptoms',          emoji: '🩺' },
  { href: '/ai-coach',       label: 'AI Coach',          emoji: '🤖' },
  { href: '/experts',        label: 'Experts',           emoji: '👨‍⚕️' },
  { href: '/consultations',  label: 'Consultations',     emoji: '📋' },
  { href: '/reports',        label: 'My Reports',        emoji: '📄' },
  { href: '/products',       label: 'Products & Orders', emoji: '🛒' },
  { href: '/scan-qr',        label: 'Scan QR',           emoji: '📱' },
  { href: '/achievements',   label: 'Achievements',      emoji: '🏆' },
  { href: '/settings',       label: 'Settings',          emoji: '⚙️' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#0D0F18] border-r border-[#1E2133] z-50 flex flex-col
          transition-transform duration-300 ease-out
          /* Mobile Drawer */
          w-[250px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          /* Tablet Icon Rail */
          md:translate-x-0 md:w-[68px]
          /* Desktop Full Sidebar */
          lg:w-[220px]
          overflow-y-auto overflow-x-hidden
        `}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-[#1E2133] shrink-0 flex items-center justify-between">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center font-extrabold text-white text-base shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              F
            </div>
            <div className="flex flex-col md:hidden lg:flex">
              <span className="font-['Outfit'] text-lg font-extrabold text-[#E8EAF6] tracking-tight leading-tight">
                FLUETAS
              </span>
              <span className="text-[#8B91B0] text-[0.58rem] font-bold tracking-wider uppercase">
                SUPERFRUIT NUTRITION
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8B91B0] hover:text-white hover:bg-[#1E2133] lg:hidden md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium no-underline transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-[rgba(16,185,129,0.2)] to-[rgba(16,185,129,0.05)] text-[#10B981] border border-[rgba(16,185,129,0.25)] font-semibold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'text-[#8B91B0] hover:bg-[#181B26] hover:text-[#E8EAF6]'
                  }
                  md:justify-center lg:justify-start
                `}
                id={`nav-${item.href.replace(/\//g, '-').slice(1)}`}
              >
                <span className="text-base shrink-0">{item.emoji}</span>
                <span className="truncate md:hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI Bot Card (Hidden on Tablet, visible on Mobile & Desktop) */}
        <div className="m-2.5 p-3 rounded-xl bg-gradient-to-br from-[rgba(16,185,129,0.14)] to-[rgba(16,185,129,0.03)] border border-[rgba(16,185,129,0.25)] shrink-0 md:hidden lg:block">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div>
              <p className="text-[#E8EAF6] text-[0.7rem] font-bold m-0 leading-none">TALK TO</p>
              <p className="text-[#10B981] text-[0.7rem] font-bold m-0 leading-none">FLUETAS AI</p>
            </div>
          </div>
          <p className="text-[#8B91B0] text-[0.65rem] mb-2 leading-tight">
            Ask about recovery, nutrition, workouts or clinical advice.
          </p>
          <Link
            href="/ai-coach"
            onClick={onClose}
            className="btn-primary w-full justify-center py-1 text-[0.7rem] no-underline"
            id="sidebar-chat-now-btn"
          >
            Chat Now
          </Link>
        </div>

        {/* Tablet Icon for AI Bot */}
        <div className="hidden md:flex lg:hidden justify-center p-2 mb-1 shrink-0">
          <Link
            href="/ai-coach"
            title="Talk to FLUETAS AI"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-lg shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
          >
            🤖
          </Link>
        </div>

        {/* Sign Out */}
        {user && (
          <div className="p-2 border-t border-[#1E2133] shrink-0">
            <button
              id="sidebar-signout-btn"
              onClick={() => signOut()}
              className="w-full py-1.5 px-2 rounded-lg bg-transparent border border-[#1E2133] text-[#8B91B0] hover:text-white hover:bg-[#181B26] text-xs transition-colors cursor-pointer"
            >
              <span className="md:hidden lg:inline">Sign Out</span>
              <span className="hidden md:inline lg:hidden">🚪</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
