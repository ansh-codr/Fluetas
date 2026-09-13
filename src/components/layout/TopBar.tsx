'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, Search, Menu, X, CheckCheck, MessageSquareHeart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { useNotifications } from '@/hooks/useNotifications';
import { openFeedbackDialog } from '@/components/ui/FeedbackWidget';
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
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  return (
    <header className="h-[60px] fixed top-0 left-0 md:left-[68px] lg:left-[220px] right-0 bg-surface/80 backdrop-blur-xl border-b border-rule flex items-center px-3 sm:px-5 gap-3 z-40 transition-all duration-300">
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center gap-2 md:hidden shrink-0">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg bg-card border border-rule text-ink-soft hover:text-ink shrink-0 cursor-pointer transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={17} />
        </button>
        <img src="/assets/image.png" alt="FLUETAS" className="w-5 h-5 object-contain" />
      </div>

      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <h2 className="font-heading text-[13px] sm:text-sm font-bold text-ink m-0 truncate">
          {getGreeting()}, {firstName}! 👋
        </h2>
        <p className="text-ink-subtle text-[10px] sm:text-[11px] m-0 truncate hidden sm:block">
          Here&apos;s your FLUETAS health &amp; wellness overview for today.
        </p>
      </div>

      {/* Desktop Search */}
      <div className="hidden sm:flex items-center gap-2 bg-card border border-rule focus-within:border-leaf focus-within:ring-2 focus-within:ring-leaf-dim rounded-xl px-3 py-2 min-w-[170px] lg:min-w-[240px] transition-all">
        <Search size={14} className="text-ink-subtle shrink-0" />
        <input
          id="topbar-search"
          placeholder="Search logs, vitals, experts..."
          className="bg-transparent border-none outline-none text-ink placeholder-ink-muted text-[12px] flex-1 min-w-0"
        />
      </div>

      {/* Mobile Search Trigger */}
      <button
        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
        className="sm:hidden p-2 rounded-lg bg-card border border-rule text-ink-soft hover:text-ink shrink-0 cursor-pointer transition-colors"
        aria-label="Search"
      >
        <Search size={15} />
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="topbar-notifications-btn"
            onClick={handleNotifOpen}
            className="relative w-8 h-8 rounded-xl bg-card border border-rule flex items-center justify-center text-ink-soft hover:text-ink hover:border-leaf/30 transition-colors cursor-pointer shrink-0"
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] rounded-full bg-leaf text-white text-[9px] font-bold flex items-center justify-center px-0.5 border border-card">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-[300px] bg-card border border-rule rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-3 border-b border-rule bg-surface-2/50">
                <span className="font-heading text-[13px] font-bold text-ink">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="flex items-center gap-1 text-[10px] text-leaf font-semibold hover:underline cursor-pointer"
                  >
                    <CheckCheck size={11} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-2">
                      <Bell size={18} className="text-ink-subtle" />
                    </div>
                    <p className="text-[12px] font-semibold text-ink m-0">No notifications</p>
                    <p className="text-[10px] text-ink-subtle m-0 mt-0.5">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left p-3 border-b border-rule/50 last:border-0 hover:bg-surface-2 transition-colors cursor-pointer ${!n.read ? 'bg-leaf/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-leaf mt-1.5 shrink-0" />}
                        <div className="flex-1 min-w-0" style={{ paddingLeft: n.read ? '8px' : '' }}>
                          <p className="text-[11px] font-semibold text-ink m-0 leading-tight">{n.title}</p>
                          <p className="text-[10px] text-ink-subtle m-0 mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-[9px] text-ink-muted m-0 mt-1 font-mono">
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

        {/* Quick Feedback Trigger */}
        <button
          onClick={() => openFeedbackDialog()}
          id="topbar-feedback-btn"
          className="w-8 h-8 rounded-xl bg-card border border-rule flex items-center justify-center text-ink-soft hover:text-leaf hover:border-leaf/30 transition-colors cursor-pointer shrink-0"
          aria-label="Send Feedback"
          title="Share Feedback & Suggestions"
        >
          <MessageSquareHeart size={15} />
        </button>

        {/* Calendar */}
        <Link
          href="/consultations"
          id="topbar-calendar-btn"
          className="w-8 h-8 rounded-xl bg-card border border-rule flex items-center justify-center text-ink-soft hover:text-ink hover:border-leaf/30 transition-colors shrink-0 hidden sm:flex no-underline"
          aria-label="View appointments"
          title="View appointments"
        >
          <Calendar size={15} />
        </Link>

        {/* Profile Card */}
        <Link
          href="/profile"
          className="flex items-center gap-2 bg-card border border-rule rounded-xl px-2.5 py-1.5 shrink-0 hover:border-leaf/30 transition-colors no-underline"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-leaf to-leaf/80 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm">
            {firstName[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-ink text-[11px] font-semibold m-0 leading-tight truncate max-w-[90px] lg:max-w-[120px]">
              {displayName}
            </p>
            <p className={`text-[9px] font-medium m-0 flex items-center gap-1 ${isPremium ? 'text-ember' : 'text-ink-subtle'}`}>
              {isPremium ? 'Premium ⭐' : 'Free Plan'}
            </p>
          </div>
        </Link>
      </div>

      {/* Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="absolute top-[60px] left-0 right-0 p-3 bg-card border-b border-rule shadow-lg flex items-center gap-2 sm:hidden animate-slide-up z-50">
          <div className="flex-1 flex items-center gap-2 bg-surface border border-rule rounded-xl px-3 py-2">
            <Search size={14} className="text-ink-subtle" />
            <input
              autoFocus
              placeholder="Search anything..."
              className="bg-transparent border-none outline-none text-ink placeholder-ink-muted text-[12px] flex-1"
            />
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-ink-soft hover:text-ink rounded-lg hover:bg-surface-2 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </header>
  );
}
