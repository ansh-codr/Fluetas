'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import {
  getAllCycleLogs,
  getCycleSettings,
} from '@/lib/services/cycleService';
import { DailyCycleLog, CycleSettings, CycleAnalysis } from '@/lib/cycle/types';
import { analyzeCycleData } from '@/lib/cycle/calculator';
import { Heart, Plus, CalendarHeart, Moon } from 'lucide-react';

export default function CycleTracker() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [logs, setLogs] = useState<DailyCycleLog[]>([]);
  const [settings, setSettings] = useState<CycleSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([getAllCycleLogs(user.uid), getCycleSettings(user.uid)])
      .then(([fetchedLogs, fetchedSettings]) => {
        setLogs(fetchedLogs);
        setSettings(fetchedSettings);
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

  const analysis: CycleAnalysis = analyzeCycleData(logs, settings || undefined);
  const latestLog = logs[0];

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
        ) : !analysis.configured && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
            <div className="w-9 h-9 rounded-xl bg-[#C23B6B]/10 text-[#C23B6B] flex items-center justify-center mb-2">
              <Heart size={16} />
            </div>
            <p className="text-xs font-bold text-[#12160F] m-0">No cycle entry logged</p>
            <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5 max-w-[190px]">
              Set up your cycle or log period dates for personalized phase telemetry.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2.5 bg-[#FDF2F8]/60 rounded-xl border border-[#C23B6B]/15">
              <div>
                <span className="text-[0.65rem] text-[#8A9482] block">Current Phase</span>
                <p className="text-xs font-bold text-[#12160F] m-0">
                  {analysis.currentCycleDay
                    ? `Day ${analysis.currentCycleDay} · ${analysis.currentPhase}`
                    : analysis.currentPhase}
                </p>
              </div>
              {analysis.predictedNextPeriodStart && !analysis.factorsSuppressingPredictions && (
                <div className="text-right">
                  <span className="text-[0.62rem] text-[#8A9482] block">Next Period</span>
                  <span className="text-xs font-bold text-[#C23B6B]">
                    ~ {new Date(analysis.predictedNextPeriodStart + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {latestLog && (
              <div className="text-xs text-[#586151] flex items-center justify-between px-1">
                <span>Last Logged: <strong>{latestLog.date}</strong></span>
                {latestLog.flow && latestLog.flow !== 'none' && (
                  <span className="text-[0.68rem] font-bold text-[#C23B6B] capitalize">
                    {latestLog.flow} flow
                  </span>
                )}
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
