'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProgressBar from '@/components/ui/ProgressBar';
import { getUserAchievements, UserAchievementsData } from '@/lib/services/achievementService';
import { AnimatedNumber, Skeleton } from '@/components/motion/MotionUtils';
import {
  Trophy,
  Flame,
  Lock,
  Sparkles,
  ArrowRight,
  Dumbbell,
  Droplets,
  Moon,
} from 'lucide-react';

export default function AchievementsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<UserAchievementsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getUserAchievements(user.uid)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const { level = 1, levelTitle = 'Health Explorer', currentXp = 0, nextLevelXp = 250, totalXp = 0, hasActivity = false, streaks = [], badges = [] } = data || {};
  const xpPct = Math.round((currentXp / nextLevelXp) * 100);

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Level Header Card */}
      <div className="fluetas-card p-5 sm:p-6 bg-white border border-[rgba(18,22,15,0.10)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D97706]/10 border border-[#D97706]/20 flex items-center justify-center text-3xl font-black text-[#D97706] shadow-sm shrink-0">
              ⚡<AnimatedNumber value={level} duration={400} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
                  Level {level} Milestone
                </span>
                {totalXp > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20">
                    <AnimatedNumber value={totalXp} duration={500} /> Total XP
                  </span>
                )}
              </div>
              <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0 mt-0.5">
                {levelTitle}
              </h1>
              <p className="text-xs text-[#586151] m-0 mt-1">
                <AnimatedNumber value={currentXp} duration={500} /> / {nextLevelXp} XP to Level {level + 1}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-56 self-stretch sm:self-auto">
            <div className="flex justify-between text-xs font-semibold mb-1 text-[#586151]">
              <span>Progress to Next Tier</span>
              <span className="text-[#D97706]"><AnimatedNumber value={xpPct} duration={500} suffix="%" /></span>
            </div>
            <ProgressBar value={xpPct} color="#D97706" height={8} />
          </div>
        </div>
      </div>

      {/* Zero Activity Empty State Guidance */}
      {!hasActivity && (
        <div className="fluetas-card p-6 bg-[#FAFAF6] border border-dashed border-[rgba(18,22,15,0.15)] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-3">
            <Sparkles size={24} />
          </div>
          <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
            Start earning achievements with real activity
          </h3>
          <p className="text-xs text-[#586151] max-w-md mt-1.5 mb-4 leading-relaxed">
            FLUETAS achievements are calculated directly from your logged workouts, daily water, and sleep telemetry. Zero manufactured stats.
          </p>
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <Link
              href="/workouts"
              className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold no-underline"
            >
              <Dumbbell size={13} /> Complete Workout (+50 XP)
            </Link>
            <Link
              href="/hydration"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[rgba(18,22,15,0.12)] text-[#2E6DA4] text-xs font-bold flex items-center gap-1.5 no-underline hover:bg-[#F2F4EE] transition-colors"
            >
              <Droplets size={13} /> Log Hydration (+20 XP)
            </Link>
            <Link
              href="/sleep"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[rgba(18,22,15,0.12)] text-[#7A4E9E] text-xs font-bold flex items-center gap-1.5 no-underline hover:bg-[#F2F4EE] transition-colors"
            >
              <Moon size={13} /> Track Sleep (+20 XP)
            </Link>
          </div>
        </div>
      )}

      {/* Active Streaks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame size={18} className="text-[#D9622B]" />
          <span className="section-title">ACTIVE CONSISTENCY STREAKS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {streaks.map(streak => (
            <div
              key={streak.title}
              className="fluetas-card p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
                style={{ backgroundColor: `${streak.color}15`, borderColor: `${streak.color}35` }}
              >
                {streak.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[0.68rem] font-bold text-[#586151] uppercase block">
                  {streak.title}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-['Outfit'] text-xl font-black text-[#12160F]">
                    <AnimatedNumber value={streak.days} duration={500} />
                  </span>
                  <span className="text-xs font-bold" style={{ color: streak.color }}>
                    Days in a Row
                  </span>
                </div>
                <p className="text-[0.68rem] text-[#586151] m-0 truncate mt-0.5">
                  {streak.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Grid (Earned vs Locked) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={18} className="text-[#2E7D32]" />
          <span className="section-title">
            BADGES &amp; MILESTONES ({badges.filter(b => b.earned).length}/{badges.length} EARNED)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`fluetas-card p-4.5 flex items-start gap-3.5 transition-all ${
                badge.earned
                  ? 'bg-white border-[rgba(18,22,15,0.10)] hover:shadow-md'
                  : 'bg-[#F2F4EE]/60 border-[rgba(18,22,15,0.06)] opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                  badge.earned
                    ? 'border-[#2E7D32]/30'
                    : 'border-[rgba(18,22,15,0.10)] grayscale'
                }`}
                style={{ backgroundColor: badge.earned ? `${badge.color}15` : '#F2F4EE' }}
              >
                {badge.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-['Outfit'] text-sm font-bold text-[#12160F] m-0 truncate">
                    {badge.name}
                  </h3>
                  {badge.earned ? (
                    <span className="text-[0.62rem] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded">
                      Earned
                    </span>
                  ) : (
                    <span className="text-[0.62rem] font-bold text-[#8A9482] flex items-center gap-1">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#586151] m-0 mt-1 leading-snug">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
