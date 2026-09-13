'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';

const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/workouts', label: 'Work', icon: Dumbbell },
  { href: '/nutrition', label: 'Food', icon: UtensilsCrossed },
  { href: '/health-record', label: 'Health', icon: HeartPulse },
  { href: '/consultations', label: 'Docs', icon: Stethoscope },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-rule py-1 px-3 shadow-[0_-2px_12px_rgba(18,22,15,0.04)]">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl no-underline transition-all duration-150 active:scale-95
                ${isActive
                  ? 'text-leaf font-bold'
                  : 'text-ink-subtle hover:text-ink'
                }
              `}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-leaf-dim' : ''}`}>
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.7} />
              </div>
              <span className="text-[9px] tracking-tight font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
