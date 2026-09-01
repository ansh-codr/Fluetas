'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  HeartPulse,
  Stethoscope,
  User,
} from 'lucide-react';

const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/workouts', label: 'Train', icon: Dumbbell },
  { href: '/health-record', label: 'Health', icon: HeartPulse },
  { href: '/consultations', label: 'Care', icon: Stethoscope },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[rgba(18,22,15,0.08)] py-1.5 px-3 shadow-[0_-4px_16px_rgba(18,22,15,0.03)]">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-decoration-none no-underline transition-all duration-150 active:scale-95
                ${isActive
                  ? 'text-[#2E7D32] font-bold'
                  : 'text-[#586151] hover:text-[#12160F]'
                }
              `}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#2E7D32]/10' : ''}`}>
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className="text-[0.65rem] tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
