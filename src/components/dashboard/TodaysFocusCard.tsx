'use client';

import React from 'react';
import Link from 'next/link';
import { useWorkout } from '@/hooks/useWorkout';
import { useNutrition } from '@/hooks/useNutrition';
import { useHydration } from '@/hooks/useHydration';
import { useSleep } from '@/hooks/useSleep';
import {
  Droplets,
  Dumbbell,
  UtensilsCrossed,
  Moon,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

export default function TodaysFocusCard() {
  const { todaySession, loading: wLoad } = useWorkout();
  const { totals, meals, loading: nLoad } = useNutrition();
  const { totalMl, goalMl, pct: hPct, loading: hLoad } = useHydration();
  const { todaySleep, targetHrs, loading: sLoad } = useSleep();

  const loading = wLoad || nLoad || hLoad || sLoad;
  const sleepPct = todaySleep ? Math.min(100, Math.round((todaySleep.durationHrs / targetHrs) * 100)) : 0;

  const focusItems = [
    {
      id: 'workout',
      label: 'Workout',
      icon: Dumbbell,
      progress: todaySession?.status === 'completed' ? 100 : todaySession?.status === 'active' ? 50 : 0,
      done: todaySession?.status === 'completed',
      detail: todaySession
        ? todaySession.status === 'completed'
          ? `${todaySession.workoutName} · Done`
          : `${todaySession.workoutName} · In Progress`
        : 'Upper Body · Ready to start',
      actionText: todaySession?.status === 'completed' ? 'View' : 'Start',
      color: '#2E7D32',
      bg: 'bg-[#2E7D32]/10',
      href: '/workouts',
    },
    {
      id: 'hydration',
      label: 'Hydration',
      icon: Droplets,
      progress: hPct,
      done: hPct >= 100,
      detail: totalMl > 0
        ? `${(totalMl / 1000).toFixed(1)}L / ${(goalMl / 1000).toFixed(1)}L`
        : `${(goalMl / 1000).toFixed(1)}L target today`,
      actionText: '+250ml',
      color: '#2E6DA4',
      bg: 'bg-[#2E6DA4]/10',
      href: '/hydration',
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      icon: UtensilsCrossed,
      progress: Math.min(100, meals.length * 25),
      done: meals.length >= 4,
      detail: meals.length > 0
        ? `${meals.length} meal${meals.length > 1 ? 's' : ''} · ${totals.calories} kcal`
        : '0 meals logged today',
      actionText: 'Log Meal',
      color: '#D9622B',
      bg: 'bg-[#D9622B]/10',
      href: '/nutrition',
    },
    {
      id: 'sleep',
      label: 'Sleep Target',
      icon: Moon,
      progress: sleepPct,
      done: sleepPct >= 90,
      detail: todaySleep
        ? `${todaySleep.durationHrs}h logged`
        : `Target: ${targetHrs}h bedtime 10:45 PM`,
      actionText: 'View',
      color: '#7A4E9E',
      bg: 'bg-[#7A4E9E]/10',
      href: '/sleep',
    },
  ];

  return (
    <div className="fluetas-card p-4 sm:p-4.5 h-full flex flex-col bg-[#FFFFFF]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#2E7D32]" />
          <span className="section-title">Today&apos;s Action Plan</span>
        </div>
        <span className="text-[0.65rem] font-bold text-[#586151] bg-[#FAFAF6] px-2 py-0.5 rounded-full border border-[rgba(18,22,15,0.08)]">
          {focusItems.filter(f => f.done).length}/{focusItems.length} Complete
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-[#FAFAF6] rounded-xl animate-pulse border border-[rgba(18,22,15,0.06)]" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1">
          {focusItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                id={`focus-${item.id}`}
                className="group flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FAFAF6] hover:bg-[#FFFFFF] border border-[rgba(18,22,15,0.06)] hover:border-[#2E7D32]/30 hover:shadow-2xs transition-all no-underline"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon size={15} style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold text-[#12160F] m-0 truncate">{item.label}</p>
                      {item.done ? (
                        <CheckCircle2 size={13} className="text-[#2E7D32] shrink-0" />
                      ) : (
                        <span className="text-[0.65rem] font-bold shrink-0" style={{ color: item.color }}>
                          {item.progress}%
                        </span>
                      )}
                    </div>
                    <p className="text-[0.68rem] text-[#586151] m-0 truncate">{item.detail}</p>
                    {!item.done && (
                      <div className="mt-1">
                        <ProgressBar value={item.progress} color={item.color} height={3} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[0.68rem] font-semibold text-[#586151] group-hover:text-[#2E7D32] shrink-0 pl-1">
                  <span>{item.actionText}</span>
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
