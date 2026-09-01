'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { getRecentCycleEntries, CycleEntry } from '@/lib/services/cycleService';
import { Heart, Plus, CalendarHeart, Moon } from 'lucide-react';

export default function CycleTracker() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getRecentCycleEntries(user.uid, 5)
      .then(res => {
        setEntries(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user]);

  // If user profile indicates Male or cycle tracking is omitted, render Recovery & Circadian Sync
  if (profile?.gender === 'Male') {
    return (
      <div className="fluetas-card p-4 sm:p-4.5 flex flex-col justify-between h-full bg-[#FFFFFF]">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Moon size={13} className="text-[#2E7D32]" />
              <span className="section-title">Circadian &amp; Recovery Sync</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32]">
              Active
            </span>
          </div>
          <p className="text-xs text-[#12160F] font-semibold m-0">
            Hormonal recovery &amp; circadian rhythm tracking
          </p>
          <p className="text-[0.6875rem] text-[#586151] m-0 mt-1 leading-relaxed">
            Optimized for natural daily recovery peaks, physical recharge, and deep restorative sleep cycles.
          </p>
        </div>
        <Link
          href="/sleep"
          className="mt-3 text-center py-2.5 rounded-xl bg-[#FAFAF6] hover:bg-[#FFFFFF] border border-[rgba(18,22,15,0.10)] text-[#586151] hover:text-[#12160F] text-xs font-semibold no-underline transition-all"
        >
          View Sleep &amp; Recovery →
        </Link>
      </div>
    );
  }

  const latestEntry = entries[0];

  return (
    <div className="fluetas-card p-4 sm:p-4.5 flex flex-col justify-between h-full bg-[#FFFFFF]">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <CalendarHeart size={13} className="text-[#C23B6B]" />
            <span className="section-title">FLUETAS HER</span>
          </div>
          <Link
            href="/cycle-tracker"
            className="text-[#C23B6B] text-xs font-semibold hover:underline no-underline"
          >
            Open Tracker →
          </Link>
        </div>

        {loading ? (
          <div className="h-24 bg-[#FAFAF6] rounded-xl animate-pulse border border-[rgba(18,22,15,0.06)]" />
        ) : !latestEntry ? (
          <div className="flex flex-col items-center justify-center py-4 text-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
            <div className="w-9 h-9 rounded-xl bg-[#C23B6B]/10 text-[#C23B6B] flex items-center justify-center mb-2">
              <Heart size={16} />
            </div>
            <p className="text-xs font-bold text-[#12160F] m-0">No cycle entry logged</p>
            <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5 max-w-[190px]">
              Log period dates or daily symptoms for personalized phase wellness context.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
              <div>
                <span className="text-[0.65rem] text-[#8A9482] block">Last Logged</span>
                <p className="text-xs font-bold text-[#12160F] m-0">{latestEntry.date}</p>
              </div>
              {latestEntry.flow && (
                <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#C23B6B]/10 text-[#C23B6B]">
                  Flow: {latestEntry.flow}
                </span>
              )}
              {latestEntry.mood && (
                <span className="text-xs font-medium text-[#12160F]">Mood: {latestEntry.mood}</span>
              )}
            </div>
            {latestEntry.symptoms && latestEntry.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {latestEntry.symptoms.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[0.62rem] bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)] text-[#586151]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Link
        href="/cycle-tracker"
        id="cycle-add-log-btn"
        className="mt-3 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[#C23B6B]/30 bg-[#C23B6B]/10 hover:bg-[#C23B6B]/15 text-[#C23B6B] text-xs font-semibold text-center no-underline transition-all"
      >
        <Plus size={14} /> Log Today&apos;s Cycle &amp; Symptoms
      </Link>
    </div>
  );
}
