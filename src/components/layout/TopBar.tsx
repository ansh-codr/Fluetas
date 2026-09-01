'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, Search, Menu, X, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';

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
  const { profile } = useUserProfile();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.name ?? user?.displayName ?? 'there';
  const firstName = displayName.split(' ')[0];
  const isPremium = profile?.premiumMember ?? false;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  const handleNotifOpen = () => {
    setNotifOpen(!notifOpen);
  };

  function formatNotifTime(ts: { seconds: number }): string {
    const d = new Date(ts.seconds * 1000);
    const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  return (
    <header className="h-16 fixed top-0 left-0 md:left-[68px] lg:left-[220px] right-0 bg-[#FAFAF6]/90 backdrop-blur-md border-b border-[rgba(18,22,15,0.10)] flex items-center px-3 sm:px-6 gap-3 sm:gap-4 z-40 transition-all duration-300">
      {/* Mobile Hamburger */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] md:hidden shrink-0 cursor-pointer shadow-xs"
        aria-label="Toggle menu"
      >
        <Menu size={18} />
      </button>

      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <h2 className="font-['Outfit'] text-sm sm:text-base lg:text-lg font-bold text-[#12160F] m-0 truncate">
          {getGreeting()}, {firstName}! 👋
        </h2>
        <p className="text-[#586151] text-[0.65rem] sm:text-xs m-0 truncate hidden sm:block">
          Here&apos;s your FLUETAS health &amp; wellness overview for today.
        </p>
      </div>

      {/* Desktop Search */}
      <div className="hidden sm:flex items-center gap-2 bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] focus-within:border-[#2E7D32] rounded-xl px-3 py-1.5 min-w-[180px] lg:min-w-[260px] shadow-xs transition-colors">
        <Search size={14} className="text-[#8A9482] shrink-0" />
        <input
          id="topbar-search"
          placeholder="Search logs, vitals, experts..."
          className="bg-transparent border-none outline-none text-[#12160F] placeholder-[#8A9482] text-xs flex-1 min-w-0"
        />
      </div>

      {/* Mobile Search Trigger */}
      <button
        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
        className="sm:hidden p-2 rounded-lg bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] shrink-0 cursor-pointer shadow-xs"
        aria-label="Search"
      >
        <Search size={16} />
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="topbar-notifications-btn"
            onClick={handleNotifOpen}
            className="relative w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] flex items-center justify-center text-[#586151] hover:text-[#12160F] hover:border-[rgba(18,22,15,0.22)] transition-colors cursor-pointer shrink-0 shadow-xs"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-[#2E7D32] text-white text-[0.55rem] font-black flex items-center justify-center px-0.5 border border-[#FAFAF6]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-3.5 border-b border-[rgba(18,22,15,0.08)] bg-[#F2F4EE]/50">
                <span className="font-['Outfit'] text-sm font-bold text-[#12160F]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="flex items-center gap-1 text-[0.65rem] text-[#2E7D32] font-semibold hover:underline cursor-pointer"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-2xl mb-1.5">🔔</p>
                    <p className="text-xs font-semibold text-[#12160F] m-0">No notifications</p>
                    <p className="text-[0.65rem] text-[#586151] m-0 mt-1">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left p-3.5 border-b border-[rgba(18,22,15,0.06)] last:border-0 hover:bg-[#F2F4EE] transition-colors cursor-pointer ${!n.read ? 'bg-[#2E7D32]/5' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0" />}
                        <div className="flex-1 min-w-0" style={{ paddingLeft: n.read ? '10px' : '' }}>
                          <p className="text-xs font-semibold text-[#12160F] m-0 leading-tight">{n.title}</p>
                          <p className="text-[0.65rem] text-[#586151] m-0 mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-[0.6rem] text-[#8A9482] m-0 mt-1 font-mono">
                            {formatNotifTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <button
          id="topbar-calendar-btn"
          className="w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] flex items-center justify-center text-[#586151] hover:text-[#12160F] hover:border-[rgba(18,22,15,0.22)] transition-colors cursor-pointer shrink-0 hidden xs:flex shadow-xs"
          aria-label="Calendar"
        >
          <Calendar size={16} />
        </button>

        {/* Profile Card */}
        <Link
          href="/profile"
          className="flex items-center gap-2 sm:gap-2.5 bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] rounded-xl px-2.5 py-1.5 shrink-0 hover:border-[rgba(18,22,15,0.25)] shadow-xs transition-colors no-underline"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-xs font-bold text-[#FAFAF6] shrink-0 shadow-[0_2px_6px_rgba(46,125,50,0.25)]">
            {firstName[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[#12160F] text-xs font-semibold m-0 leading-tight truncate max-w-[100px] lg:max-w-[130px]">
              {displayName}
            </p>
            <p className={`text-[0.62rem] font-medium m-0 flex items-center gap-1 ${isPremium ? 'text-[#D9622B]' : 'text-[#586151]'}`}>
              {isPremium ? <>Premium ⭐</> : 'Free Plan'}
            </p>
          </div>
        </Link>
      </div>

      {/* Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="absolute top-16 left-0 right-0 p-3 bg-[#FAFAF6] border-b border-[rgba(18,22,15,0.12)] shadow-xl flex items-center gap-2 sm:hidden animate-slide-up">
          <div className="flex-1 flex items-center gap-2 bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] rounded-xl px-3 py-2">
            <Search size={14} className="text-[#8A9482]" />
            <input
              autoFocus
              placeholder="Search anything..."
              className="bg-transparent border-none outline-none text-[#12160F] placeholder-[#8A9482] text-xs flex-1"
            />
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-[#586151] hover:text-[#12160F]"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
