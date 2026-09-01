'use client';

import React from 'react';
import Link from 'next/link';
import { useNutrition } from '@/hooks/useNutrition';
import { useUserProfile } from '@/context/UserProfileContext';
import { Utensils, Plus } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

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
  const proteinTarget = Math.round(calorieTarget * 0.25 / 4); // ~25% protein

  if (loading) {
    return (
      <div className="fluetas-card p-4 flex flex-col gap-3">
        <div className="h-3 w-24 bg-[#1E2133] rounded animate-pulse" />
        <div className="h-16 bg-[#1E2133] rounded-xl animate-pulse" />
        <div className="h-8 bg-[#1E2133] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="fluetas-card p-4 flex flex-col justify-between gap-3 min-h-[160px]">
        <span className="section-title">TODAY'S NUTRITION</span>
        <div className="flex flex-col items-center text-center py-3 flex-1 justify-center">
          <p className="text-3xl mb-2">🥗</p>
          <p className="text-xs font-semibold text-[#E8EAF6] m-0">No meals logged</p>
          <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-1">Log your first meal of the day</p>
        </div>
        <Link
          href="/nutrition"
          id="log-meal-btn"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-bold hover:opacity-90 transition-all no-underline"
        >
          <Plus size={13} />
          Log First Meal
        </Link>
      </div>
    );
  }

  const macros = [
    { label: 'Protein', value: totals.protein, target: proteinTarget, unit: 'g', color: '#3B82F6' },
    { label: 'Carbs', value: totals.carbs, target: Math.round(calorieTarget * 0.45 / 4), unit: 'g', color: '#22C55E' },
    { label: 'Fat', value: totals.fat, target: Math.round(calorieTarget * 0.3 / 9), unit: 'g', color: '#F59E0B' },
  ];

  return (
    <div className="fluetas-card p-4 flex flex-col gap-3 min-h-[160px]">
      <div className="flex items-center justify-between">
        <span className="section-title">TODAY'S NUTRITION</span>
        <span className="text-[0.65rem] text-[#22C55E] font-bold">{meals.length} meal{meals.length > 1 ? 's' : ''}</span>
      </div>

      {/* Calorie Ring */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="#1E2133" strokeWidth="5" />
            <circle
              cx="28" cy="28" r="22" fill="none"
              stroke="#22C55E" strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - caloriePct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[0.65rem] font-black text-[#E8EAF6]">{caloriePct}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-['Outfit'] text-base font-black text-[#E8EAF6] m-0">{totals.calories} kcal</p>
          <p className="text-[0.65rem] text-[#8B91B0] m-0">of {calorieTarget} kcal target</p>
        </div>
      </div>

      {/* Macro bars */}
      <div className="flex flex-col gap-1.5">
        {macros.map(m => (
          <div key={m.label} className="flex items-center gap-2 text-[0.65rem]">
            <span className="text-[#8B91B0] w-10 shrink-0">{m.label}</span>
            <div className="flex-1">
              <ProgressBar value={Math.min(100, Math.round((m.value / Math.max(1, m.target)) * 100))} color={m.color} height={3} />
            </div>
            <span className="font-semibold text-[#E8EAF6] w-12 text-right">{m.value}{m.unit}</span>
          </div>
        ))}
      </div>

      <Link
        href="/nutrition"
        className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] text-[0.72rem] font-semibold transition-all no-underline"
      >
        <Utensils size={12} />
        Log Another Meal
      </Link>
    </div>
  );
}
