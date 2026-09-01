'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWorkout } from '@/hooks/useWorkout';
import { useNutrition } from '@/hooks/useNutrition';
import { useHydration } from '@/hooks/useHydration';
import { useSleep } from '@/hooks/useSleep';
import { Droplets, Dumbbell, Utensils, Moon, CheckCircle2 } from 'lucide-react';
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
      id: 'hydration',
      label: 'Hydration',
      emoji: '💧',
      icon: Droplets,
      progress: hPct,
      done: hPct >= 100,
      detail: totalMl > 0
        ? `${(totalMl / 1000).toFixed(1)}L / ${(goalMl / 1000).toFixed(1)}L`
        : 'No water logged today',
      color: '#38BDF8',
      href: '/hydration',
    },
    {
      id: 'workout',
      label: 'Workout',
      emoji: '🏋️',
      icon: Dumbbell,
      progress: todaySession?.status === 'completed' ? 100 : todaySession?.status === 'active' ? 50 : 0,
      done: todaySession?.status === 'completed',
      detail: todaySession
        ? todaySession.status === 'completed'
          ? `${todaySession.workoutName} · Completed`
          : `${todaySession.workoutName} · In Progress`
        : 'No workout logged today',
      color: '#10B981',
      href: '/fluetas-train',
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      emoji: '🥗',
      icon: Utensils,
      progress: Math.min(100, meals.length * 25),
      done: meals.length >= 4,
      detail: meals.length > 0
        ? `${meals.length} meal${meals.length > 1 ? 's' : ''} · ${totals.calories} kcal`
        : 'No meals logged today',
      color: '#22C55E',
      href: '/nutrition',
    },
    {
      id: 'sleep',
      label: 'Sleep',
      emoji: '🌙',
      icon: Moon,
      progress: sleepPct,
      done: sleepPct >= 90,
      detail: todaySleep
        ? `${todaySleep.durationHrs}h logged`
        : 'No sleep recorded',
      color: '#A78BFA',
      href: '/sleep',
    },
  ];

  return (
    <div className="fluetas-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="section-title">TODAY'S FOCUS</span>
        <span className="text-[0.65rem] text-[#8B91B0]">
          {focusItems.filter(f => f.done).length}/{focusItems.length} Complete
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-[#1E2133] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 flex-1">
          {focusItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              id={`focus-${item.id}`}
              className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0B0D14] border border-[#1E2133] hover:border-[#2A3050] transition-all no-underline"
            >
              <span className="text-base">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <p className="text-xs font-semibold text-[#E8EAF6] m-0">{item.label}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.done ? (
                      <CheckCircle2 size={13} className="text-[#10B981]" />
                    ) : (
                      <span className="text-[0.62rem] font-bold" style={{ color: item.color }}>
                        {item.progress}%
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[0.65rem] text-[#8B91B0] m-0 truncate">{item.detail}</p>
                {!item.done && (
                  <div className="mt-1">
                    <ProgressBar value={item.progress} color={item.color} height={3} />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
