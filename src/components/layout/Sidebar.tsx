'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import {
  LayoutDashboard,
  HeartPulse,
  Dumbbell,
  UtensilsCrossed,
  Stethoscope,
  User,
  Settings,
  LogOut,
  X,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/health-record', label: 'Health', icon: HeartPulse },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { href: '/consultations', label: 'Doctors', icon: Stethoscope },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  useAuth();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-200"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-card z-50 flex flex-col
          transition-transform duration-300 ease-out
          border-r border-rule
          w-[260px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-[68px]
          lg:w-[220px]
        `}
      >
        {/* Brand Header */}
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-rule shrink-0 bg-card">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 no-underline group"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-surface-2">
              <img src="/assets/image.png" alt="FLUETAS" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="flex flex-col md:hidden lg:flex">
              <span className="font-heading text-[13px] font-bold text-ink leading-tight">FLUETAS</span>
              <span className="text-[9px] text-ink-subtle font-medium leading-tight">Health Platform</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-2 text-ink-subtle cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="flex flex-col gap-0.5">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold
                    transition-all duration-150 no-underline
                    ${isActive
                      ? 'bg-leaf-dim text-leaf border border-leaf/15'
                      : 'text-ink-soft hover:bg-surface-2 hover:text-ink border border-transparent'
                    }
                  `}
                >
                  <Icon size={17} className="shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="md:hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-rule p-2 shrink-0">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-ink-subtle hover:bg-red-50 hover:text-red-600 transition-all w-full cursor-pointer border-none bg-transparent"
          >
            <LogOut size={17} className="shrink-0" />
            <span className="md:hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
