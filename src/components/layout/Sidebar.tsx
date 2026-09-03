'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import {
  LayoutDashboard,
  HeartPulse,
  History,
  Stethoscope,
  FileText,
  Dumbbell,
  Video,
  TrendingUp,
  UtensilsCrossed,
  Droplets,
  Moon,
  CalendarHeart,
  Sparkles,
  UserCheck,
  ClipboardList,
  Trophy,
  User,
  Settings,
  ShoppingBag,
  QrCode,
  LogOut,
  X,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'HOME',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'MY HEALTH',
    items: [
      { href: '/health-record', label: 'Health Overview', icon: HeartPulse },
      { href: '/timeline', label: 'Timeline', icon: History },
      { href: '/symptoms', label: 'Symptoms', icon: Stethoscope },
      { href: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'FLUETAS TRAIN',
    items: [
      { href: '/workouts', label: 'Workouts', icon: Dumbbell },
      { href: '/exercises', label: 'Exercise Library', icon: Video },
      { href: '/fluetas-train', label: 'Workout History', icon: TrendingUp },
    ],
  },
  {
    title: 'WELLNESS',
    items: [
      { href: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
      { href: '/hydration', label: 'Hydration', icon: Droplets },
      { href: '/sleep', label: 'Sleep', icon: Moon },
      { href: '/fluetas-her', label: 'FLUETAS HER', icon: CalendarHeart },
    ],
  },
  {
    title: 'CARE',
    items: [
      { href: '/ai-coach', label: 'AI Coach', icon: Sparkles },
      { href: '/experts', label: 'Experts', icon: UserCheck },
      { href: '/consultations', label: 'Consultations', icon: ClipboardList },
    ],
  },
  {
    title: 'PROGRESS',
    items: [
      { href: '/achievements', label: 'Achievements', icon: Trophy },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    title: 'EXTRAS',
    items: [
      { href: '/products', label: 'Products', icon: ShoppingBag },
    ],
  },
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#FFFFFF] border-r border-[rgba(18,22,15,0.08)] z-50 flex flex-col
          transition-transform duration-300 ease-out shadow-[2px_0_12px_rgba(18,22,15,0.02)]
          /* Mobile Drawer */
          w-[260px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          /* Tablet Icon Rail */
          md:translate-x-0 md:w-[68px]
          /* Desktop Expanded */
          lg:w-[230px]
        `}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[rgba(18,22,15,0.08)] shrink-0 bg-[#FFFFFF]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-decoration-none no-underline group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2E7D32] flex items-center justify-center text-[#FAFAF6] font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              F
            </div>
            <div className="flex flex-col md:hidden lg:flex">
              <span className="font-['Outfit'] font-black text-sm tracking-widest text-[#12160F] uppercase">
                FLUETAS
              </span>
              <span className="text-[0.60rem] tracking-wider text-[#586151] uppercase -mt-0.5">
                Health Platform
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#586151] hover:text-[#12160F] hover:bg-[#F2F4EE] md:hidden transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categorized Navigation Scroll Area */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 no-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {/* Category Header (Hidden on Tablet Rail) */}
              <div className="px-2.5 pt-1 pb-1 md:hidden lg:block">
                <span className="text-[0.62rem] font-bold text-[#8A9482] uppercase tracking-wider font-['Outfit']">
                  {section.title}
                </span>
              </div>

              {/* Category Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={item.label}
                      className={`
                        flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium no-underline transition-all duration-150 group relative
                        ${isActive
                          ? 'bg-[#2E7D32]/10 text-[#2E7D32] font-semibold shadow-2xs'
                          : 'text-[#586151] hover:text-[#12160F] hover:bg-[#F2F4EE]'
                        }
                      `}
                    >
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2E7D32] rounded-r-full" />
                      )}

                      <div className={`
                        w-6 h-6 flex items-center justify-center shrink-0 rounded-md transition-transform group-hover:scale-110
                        ${isActive ? 'text-[#2E7D32]' : 'text-[#586151] group-hover:text-[#12160F]'}
                      `}>
                        <Icon size={16} />
                      </div>

                      <span className="truncate md:hidden lg:inline text-[0.8125rem]">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer Profile & Sign Out */}
        <div className="p-3 border-t border-[rgba(18,22,15,0.08)] bg-[#FAFAF6]/60 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#E8ECE2] border border-[rgba(18,22,15,0.12)] flex items-center justify-center text-xs font-bold text-[#12160F] shrink-0">
                {user?.displayName ? user.displayName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 md:hidden lg:block">
                <p className="text-xs font-semibold text-[#12160F] truncate m-0">
                  {user?.displayName || 'My Account'}
                </p>
                <p className="text-[0.62rem] text-[#8A9482] truncate m-0">
                  {user?.email || 'Logged in'}
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#586151] hover:text-[#D9622B] hover:bg-[#D9622B]/10 transition-colors shrink-0 cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
