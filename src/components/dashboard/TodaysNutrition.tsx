'use client';

import React from 'react';
import Link from 'next/link';
import { useNutrition } from '@/hooks/useNutrition';
import { useUserProfile } from '@/context/UserProfileContext';
import { UtensilsCrossed, Plus, ArrowRight } from 'lucide-react';
import { AnimatedNumber, AnimatedRing, AnimatedProgress, Skeleton } from '@/components/motion/MotionUtils';

const CALORIE_TARGETS: Record<string, number> = {
  'Build Muscle': 2400,
  'Lose Weight': 1800,
  'Improve Fitness': 2000,
  'Better Health': 2000,
  'Stress Management': 1900,
  'Sports Performance': 2600,
};

export default function TodaysNutrition() {
  const { meals, totals, loading } = useNutrition();
  const { healthProfile } = useUserProfile();

  const calorieTarget = healthProfile?.primaryGoal
    ? (CALORIE_TARGETS[healthProfile.primaryGoal] ?? 2000)
    : 2000;

  const caloriePct = Math.min(100, Math.round((totals.calories / calorieTarget) * 100));
  const proteinTarget = Math.round((calorieTarget * 0.25) / 4); // ~25% protein

  if (loading) {
    return (
      <div className="fluetas-card p-4 sm:p-4.5 flex flex-col gap-3 min-h-[170px] bg-[#FFFFFF]">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-full h-14 rounded-xl" />
        <Skeleton className="w-full h-8 rounded-xl" />
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="fluetas-card p-4 sm:p-4.5 flex flex-col justify-between gap-3 min-h-[170px] bg-[#FFFFFF]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UtensilsCrossed size={13} className="text-[#D9622B]" />
            <span className="section-title">Today&apos;s Nutrition</span>
          </div>
          <span className="text-xs text-[#8A9482]">0 meals</span>
        </div>
        <div className="flex flex-col items-center text-center py-2 flex-1 justify-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
          <p className="text-xs font-bold text-[#12160F] m-0">No meals logged yet</p>
          <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5">Track breakfast, lunch, or dinner</p>
        </div>
        <Link
          href="/nutrition"
          id="log-meal-btn"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#D9622B]/10 border border-[#D9622B]/30 text-[#D9622B] text-xs font-bold hover:bg-[#D9622B]/20 transition-all no-underline"
        >
          <Plus size={13} />
          Log First Meal
        </Link>
      </div>
    );
  }

  const macros = [
    { label: 'Protein', value: totals.protein, target: proteinTarget, unit: 'g', color: '#2E6DA4' },
    { label: 'Carbs', value: totals.carbs, target: Math.round((calorieTarget * 0.45) / 4), unit: 'g', color: '#2E7D32' },
    { label: 'Fat', value: totals.fat, target: Math.round((calorieTarget * 0.3) / 9), unit: 'g', color: '#D9622B' },
  ];

  return (
    <div className="fluetas-card p-4 sm:p-4.5 flex flex-col justify-between gap-3 min-h-[170px] bg-[#FFFFFF]">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <UtensilsCrossed size={13} className="text-[#D9622B]" />
            <span className="section-title">Today&apos;s Nutrition</span>
          </div>
          <span className="text-[0.65rem] text-[#2E7D32] font-bold bg-[#2E7D32]/10 px-2 py-0.5 rounded-full border border-[#2E7D32]/20">
            {meals.length} meal{meals.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Calorie Ring + Macro Breakdown */}
        <div className="flex items-center gap-3">
          <AnimatedRing
            size={46}
            strokeWidth={4.5}
            progress={caloriePct}
            color="#D9622B"
            trackColor="#D9622B20"
          >
            <span className="text-[0.65rem] font-bold font-mono text-[#12160F]">
              <AnimatedNumber value={caloriePct} suffix="%" duration={600} />
            </span>
          </AnimatedRing>

          <div className="flex-1 min-w-0">
            <p className="font-['Outfit'] text-sm font-bold text-[#12160F] m-0">
              <AnimatedNumber value={totals.calories} duration={700} /> kcal
            </p>
            <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5">of {calorieTarget} kcal target</p>
          </div>
        </div>

        {/* Macro Bars */}
        <div className="flex flex-col gap-1.5 mt-2.5">
          {macros.map(m => (
            <div key={m.label} className="flex items-center gap-2 text-[0.65rem]">
              <span className="text-[#586151] w-10 shrink-0 font-medium">{m.label}</span>
              <div className="flex-1">
                <AnimatedProgress
                  value={Math.min(100, Math.round((m.value / Math.max(1, m.target)) * 100))}
                  color={m.color}
                  height={3}
                  showGlow={false}
                />
              </div>
              <span className="font-semibold text-[#12160F] w-11 text-right font-mono">
                <AnimatedNumber value={m.value} duration={600} />
                {m.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/nutrition"
        className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] hover:bg-[#FAFAF6] text-xs font-semibold transition-all no-underline mt-1"
      >
        <UtensilsCrossed size={12} />
        <span>Log Meal</span>
        <ArrowRight size={11} />
      </Link>
    </div>
  );
}
