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
  LucideIcon
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
  const { user } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#FFFFFF] border-r border-[rgba(18,22,15,0.08)] z-50 flex flex-col
          transition-transform duration-300 ease-out shadow-[2px_0_12px_rgba(18,22,15,0.02)]
          w-[260px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-[68px]
          lg:w-[220px]
        `}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[rgba(18,22,15,0.08)] shrink-0 bg-[#FFFFFF]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-decoration-none no-underline group"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-[#12160F]/5">
              <img src="/assets/image.png" alt="FLUETAS" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="flex flex-col md:hidden lg:flex">
              <span className="font-['Outfit'] text-sm font-black text-[#12160F] leading-tight">FLUETAS</span>
              <span className="text-[0.6rem] text-[#8A9482] font-semibold leading-tight">Health Platform</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-[#F2F4EE] text-[#586151] cursor-pointer"
          >
            <X size={18} />
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
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold
                    transition-all duration-200 no-underline
                    ${isActive
                      ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                      : 'text-[#586151] hover:bg-[#F2F4EE] hover:text-[#12160F] border border-transparent'
                    }
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="md:hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-[rgba(18,22,15,0.08)] p-2 shrink-0">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#586151] hover:bg-red-50 hover:text-red-600 transition-all w-full cursor-pointer border-none bg-transparent"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="md:hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
