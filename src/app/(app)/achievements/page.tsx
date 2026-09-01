'use client';

import React from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import { mockAchievements } from '@/lib/mock/dashboardData';
import {
  Trophy,
  Flame,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export default function AchievementsPage() {
  const { level, levelTitle, currentXp, nextLevelXp, streaks, badges } = mockAchievements;
  const xpPct = Math.round((currentXp / nextLevelXp) * 100);

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Level Header Card */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#1E1A2E] to-[#122A1E] border-[#F59E0B]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-3xl font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0">
              ⚡{level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                  Level {level} Milestone
                </span>
                <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#F59E0B]/20 text-[#F59E0B]">
                  Top 5% Health Optimizer
                </span>
              </div>
              <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0 mt-0.5">
                {levelTitle}
              </h1>
              <p className="text-xs text-[#8B91B0] m-0 mt-1">
                {currentXp} / {nextLevelXp} XP to Level {level + 1}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-56 self-stretch sm:self-auto">
            <div className="flex justify-between text-xs font-semibold mb-1 text-[#8B91B0]">
              <span>Progress</span>
              <span className="text-[#F59E0B]">{xpPct}%</span>
            </div>
            <ProgressBar value={xpPct} color="#F59E0B" height={8} />
          </div>
        </div>
      </div>

      {/* Active Streaks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame size={18} className="text-[#FB923C]" />
          <span className="section-title">ACTIVE CONSISTENCY STREAKS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {streaks.map(streak => (
            <div
              key={streak.title}
              className="fluetas-card p-4 flex items-center gap-3.5 hover:border-[#2A3050] transition-colors"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
                style={{ backgroundColor: `${streak.color}15`, borderColor: `${streak.color}35` }}
              >
                {streak.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[0.68rem] font-bold text-[#8B91B0] uppercase block">
                  {streak.title}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-['Outfit'] text-xl font-black text-[#E8EAF6]">
                    {streak.days}
                  </span>
                  <span className="text-xs font-bold" style={{ color: streak.color }}>
                    Days in a Row
                  </span>
                </div>
                <p className="text-[0.68rem] text-[#8B91B0] m-0 truncate mt-0.5">
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
          <Trophy size={18} className="text-[#10B981]" />
          <span className="section-title">BADGES & TROPHIES ({badges.filter(b => b.earned).length}/{badges.length} EARNED)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`fluetas-card p-4.5 flex items-start gap-3.5 transition-all ${
                badge.earned
                  ? 'bg-gradient-to-br from-[#13161F] to-[#181B26] border-[#1E2133] hover:border-[#10B981]/50'
                  : 'bg-[#0B0D14]/60 border-[#1E2133]/60 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                  badge.earned
                    ? 'border-[#10B981]/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'border-[#1E2133] grayscale'
                }`}
                style={{ backgroundColor: badge.earned ? `${badge.color}15` : '#13161F' }}
              >
                {badge.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0 truncate">
                    {badge.name}
                  </h3>
                  {badge.earned ? (
                    <span className="text-[0.62rem] font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">
                      Earned
                    </span>
                  ) : (
                    <span className="text-[0.62rem] font-bold text-[#8B91B0] flex items-center gap-1">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#8B91B0] m-0 mt-1 leading-snug">
                  {badge.desc}
                </p>

                <p className="text-[0.65rem] font-semibold text-[#10B981] m-0 mt-2">
                  {badge.earned ? `Unlocked ${badge.date}` : `Progress: ${badge.progress}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
