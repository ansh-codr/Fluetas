'use client';

import React from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Droplet,
  UtensilsCrossed,
  Moon,
  QrCode,
  FileUp,
  Bot,
  UserCheck,
  Sparkles
} from 'lucide-react';

const actions = [
  { id: 'workout', label: 'Log Workout', href: '/workouts', icon: Dumbbell, color: 'text-[#2E7D32]', bg: 'bg-[#2E7D32]/10', border: 'hover:border-[#2E7D32]/40' },
  { id: 'water', label: 'Log Water', href: '/hydration', icon: Droplet, color: 'text-[#2E6DA4]', bg: 'bg-[#2E6DA4]/10', border: 'hover:border-[#2E6DA4]/40' },
  { id: 'meal', label: 'Log Meal', href: '/nutrition', icon: UtensilsCrossed, color: 'text-[#D9622B]', bg: 'bg-[#D9622B]/10', border: 'hover:border-[#D9622B]/40' },
  { id: 'sleep', label: 'Track Sleep', href: '/sleep', icon: Moon, color: 'text-[#7A4E9E]', bg: 'bg-[#7A4E9E]/10', border: 'hover:border-[#7A4E9E]/40' },
  { id: 'qr', label: 'Scan QR', href: '/scan-qr', icon: QrCode, color: 'text-[#0F766E]', bg: 'bg-[#0F766E]/10', border: 'hover:border-[#0F766E]/40' },
  { id: 'report', label: 'Upload Report', href: '/reports', icon: FileUp, color: 'text-[#C23B6B]', bg: 'bg-[#C23B6B]/10', border: 'hover:border-[#C23B6B]/40' },
  { id: 'ai', label: 'Talk to AI', href: '/ai-coach', icon: Bot, color: 'text-[#2E7D32]', bg: 'bg-[#2E7D32]/10', border: 'hover:border-[#2E7D32]/40' },
  { id: 'expert', label: 'Book Expert', href: '/experts', icon: UserCheck, color: 'text-[#2E6DA4]', bg: 'bg-[#2E6DA4]/10', border: 'hover:border-[#2E6DA4]/40' },
];

export default function QuickActions() {
  return (
    <div
      id="quick-actions-bar"
      className="bg-[#FFFFFF] border border-[rgba(18,22,15,0.08)] rounded-2xl p-2.5 sm:p-3 shadow-xs"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#2E7D32]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#586151] font-['Outfit']">
            Quick Actions
          </span>
        </div>
        <span className="text-[0.65rem] text-[#8A9482] hidden sm:inline">
          Fast logging &amp; instant shortcuts
        </span>
      </div>

      {/* Action Chips Grid / Horizontal Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {actions.map(act => {
          const Icon = act.icon;
          return (
            <Link
              key={act.id}
              href={act.href}
              id={`quick-action-${act.id}`}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F2F4EE] hover:bg-[#FFFFFF]
                border border-[rgba(18,22,15,0.06)] ${act.border}
                text-xs font-semibold text-[#12160F] no-underline shrink-0
                hover:shadow-xs transition-all duration-150 active:scale-95 group
              `}
            >
              <div className={`w-6 h-6 rounded-lg ${act.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={13} className={act.color} />
              </div>
              <span className="whitespace-nowrap">{act.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
