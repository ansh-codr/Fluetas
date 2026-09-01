'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { getRecentCycleEntries, CycleEntry } from '@/lib/services/cycleService';
import { Heart, Plus, Sparkles } from 'lucide-react';

const phaseColors: Record<string, string> = {
  Period: '#F472B6',
  Follicular: '#38BDF8',
  Ovulation: '#10B981',
  Luteal: '#A78BFA',
};

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

  // If user is male, render a subtle card or general recovery sync
  if (profile?.gender === 'Male') {
    return (
      <div className="fluetas-card p-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="section-title">CIRCADIAN &amp; HORMONAL SYNC</span>
            <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-[#10B981]/15 text-[#10B981]">
              Active
            </span>
          </div>
          <p className="text-xs text-[#E8EAF6] font-medium m-0">
            Hormonal recovery &amp; cortisol rhythm tracking.
          </p>
          <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-1">
            Optimized for daily testosterone peaks and deep sleep restoration.
          </p>
        </div>
        <Link
          href="/sleep"
          className="mt-3 text-center py-2 rounded-xl bg-[#0B0D14] border border-[#1E2133] hover:border-[#2A3050] text-[#8B91B0] hover:text-[#E8EAF6] text-xs font-semibold no-underline transition-all"
        >
          View Sleep &amp; Recovery →
        </Link>
      </div>
    );
  }

  const latestEntry = entries[0];

  return (
    <div className="fluetas-card p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="section-title">FLUETAS HER — CYCLE</span>
          <Link
            href="/cycle-tracker"
            className="text-[#F472B6] text-xs font-semibold hover:underline no-underline"
          >
            Open Tracker
          </Link>
        </div>

        {loading ? (
          <div className="h-24 bg-[#1E2133]/40 rounded-xl animate-pulse" />
        ) : !latestEntry ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#F472B6]/15 text-[#F472B6] flex items-center justify-center mb-2">
              <Heart size={18} />
            </div>
            <p className="text-xs font-semibold text-[#E8EAF6] m-0">No cycle entry logged</p>
            <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-0.5">
              Log your period or daily symptoms for personalized phase guidance.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2.5 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
              <div>
                <span className="text-[0.65rem] text-[#8B91B0] block">Last Logged</span>
                <p className="text-xs font-bold text-[#E8EAF6] m-0">{latestEntry.date}</p>
              </div>
              {latestEntry.flow && (
                <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#F472B6]/15 text-[#F472B6]">
                  Flow: {latestEntry.flow}
                </span>
              )}
              {latestEntry.mood && (
                <span className="text-xs text-[#E8EAF6]">Mood: {latestEntry.mood}</span>
              )}
            </div>
            {latestEntry.symptoms && latestEntry.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {latestEntry.symptoms.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[0.6rem] bg-[#1E2133] text-[#8B91B0]"
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
        className="mt-3 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-[#F472B6]/30 bg-[#F472B6]/10 hover:bg-[#F472B6]/15 text-[#F472B6] text-xs font-semibold text-center no-underline transition-all"
      >
        <Plus size={14} /> Log Today&apos;s Cycle &amp; Symptoms
      </Link>
    </div>
  );
}
