'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { X, Shield } from 'lucide-react';

const adminNavItems = [
  { href: '/admin/dashboard',     label: 'Overview',              emoji: '📊' },
  { href: '/admin/users',         label: 'Users Management',      emoji: '👤' },
  { href: '/admin/doctors',       label: 'Doctor Verification',   emoji: '🛡️' },
  { href: '/admin/consultations', label: 'Consultations Ops',     emoji: '📋' },
  { href: '/admin/exercises',     label: 'Exercise Content',      emoji: '🏋️' },
  { href: '/admin/nutrition',     label: 'Nutrition Catalog',     emoji: '🥗' },
  { href: '/admin/audit-logs',    label: 'Audit & Access Logs',   emoji: '📜' },
  { href: '/admin/settings',      label: 'System Settings',       emoji: '⚙️' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#FFFFFF] border-r border-[rgba(18,22,15,0.10)] z-50 flex flex-col
          transition-transform duration-300 ease-out shadow-[2px_0_12px_rgba(18,22,15,0.03)]
          w-[250px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-[68px]
          lg:w-[220px]
          overflow-y-auto overflow-x-hidden
        `}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-[rgba(18,22,15,0.08)] shrink-0 flex items-center justify-between">
          <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D9622B] to-[#B84E1E] flex items-center justify-center font-extrabold text-[#FAFAF6] text-base shrink-0 shadow-[0_2px_8px_rgba(217,98,43,0.25)]">
              ⚡
            </div>
            <div className="flex flex-col md:hidden lg:flex">
              <span className="font-['Outfit'] text-lg font-extrabold text-[#12160F] tracking-tight leading-tight">
                FLUETAS
              </span>
              <span className="text-[#D9622B] text-[0.58rem] font-bold tracking-wider uppercase">
                ADMIN CONSOLE
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#586151] hover:text-[#12160F] hover:bg-[#F2F4EE] lg:hidden md:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin Navigation Items */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-1">
          {adminNavItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium no-underline transition-all
                  ${isActive
                    ? 'bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/25 font-semibold shadow-sm'
                    : 'text-[#586151] hover:bg-[#F2F4EE] hover:text-[#12160F]'
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

        {/* Security & Audit Notice */}
        <div className="m-2.5 p-3 rounded-xl bg-gradient-to-br from-[#D9622B]/10 to-[#D9622B]/5 border border-[#D9622B]/20 shrink-0 md:hidden lg:block">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-[#D9622B]" />
            <span className="text-[0.7rem] font-bold text-[#D9622B]">AUDITED SESSION</span>
          </div>
          <p className="text-[#586151] text-[0.62rem] m-0 leading-tight">
            All administrative queries and verification actions are immutably logged to the audit trail.
          </p>
        </div>

        {/* Sign Out */}
        {user && (
          <div className="p-2 border-t border-[rgba(18,22,15,0.08)] shrink-0">
            <button
              id="admin-sidebar-signout-btn"
              onClick={() => signOut()}
              className="w-full py-1.5 px-2 rounded-lg bg-transparent border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] hover:bg-[#F2F4EE] text-xs transition-colors cursor-pointer"
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
