'use client';

import React from 'react';
import Link from 'next/link';
import { useNutrition } from '@/hooks/useNutrition';
import { useUserProfile } from '@/context/UserProfileContext';
import { Utensils, Plus, ArrowRight } from 'lucide-react';
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
      <div className="fluetas-card p-4 flex flex-col gap-3 min-h-[170px]">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-full h-14" />
        <Skeleton className="w-full h-8" />
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="fluetas-card-interactive p-4 flex flex-col justify-between gap-3 min-h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="section-title">TODAY&apos;S NUTRITION</span>
          <span className="text-base group-hover:scale-110 transition-transform">🥗</span>
        </div>
        <div className="flex flex-col items-center text-center py-2 flex-1 justify-center">
          <p className="text-xs font-semibold text-[#E8EAF6] m-0">No meals logged</p>
          <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-0.5">Log breakfast or lunch</p>
        </div>
        <Link
          href="/nutrition"
          id="log-meal-btn"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-bold hover:bg-[#22C55E]/25 transition-all no-underline"
        >
          <Plus size={13} />
          Log First Meal
        </Link>
      </div>
    );
  }

  const macros = [
    { label: 'Protein', value: totals.protein, target: proteinTarget, unit: 'g', color: '#38BDF8' },
    { label: 'Carbs', value: totals.carbs, target: Math.round((calorieTarget * 0.45) / 4), unit: 'g', color: '#22C55E' },
    { label: 'Fat', value: totals.fat, target: Math.round((calorieTarget * 0.3) / 9), unit: 'g', color: '#F59E0B' },
  ];

  return (
    <div className="fluetas-card-interactive p-4 flex flex-col justify-between gap-3 min-h-[170px] group">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="section-title">TODAY&apos;S NUTRITION</span>
          <span className="text-[0.65rem] text-[#22C55E] font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/25">
            {meals.length} meal{meals.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Calorie Ring + Macro Breakdown */}
        <div className="flex items-center gap-3">
          <AnimatedRing
            size={46}
            strokeWidth={4.5}
            progress={caloriePct}
            color="#22C55E"
            trackColor="#22C55E20"
          >
            <span className="text-[0.65rem] font-bold font-mono">
              <AnimatedNumber value={caloriePct} suffix="%" duration={600} />
            </span>
          </AnimatedRing>

          <div className="flex-1 min-w-0">
            <p className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0">
              <AnimatedNumber value={totals.calories} duration={700} /> kcal
            </p>
            <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-0.5">of {calorieTarget} kcal target</p>
          </div>
        </div>

        {/* Macro Bars */}
        <div className="flex flex-col gap-1.5 mt-2.5">
          {macros.map(m => (
            <div key={m.label} className="flex items-center gap-2 text-[0.65rem]">
              <span className="text-[#8B91B0] w-10 shrink-0">{m.label}</span>
              <div className="flex-1">
                <AnimatedProgress
                  value={Math.min(100, Math.round((m.value / Math.max(1, m.target)) * 100))}
                  color={m.color}
                  height={3}
                  showGlow={false}
                />
              </div>
              <span className="font-semibold text-[#E8EAF6] w-11 text-right font-mono">
                <AnimatedNumber value={m.value} duration={600} />
                {m.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/nutrition"
        className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] hover:border-[#2A3050] text-[0.72rem] font-semibold transition-all no-underline mt-1"
      >
        <Utensils size={12} />
        <span>Log Meal</span>
        <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
