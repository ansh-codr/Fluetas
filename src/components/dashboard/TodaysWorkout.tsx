'use client';

import React from 'react';
import Link from 'next/link';
import { useWorkout } from '@/hooks/useWorkout';
import { Play, CheckCircle2, Dumbbell } from 'lucide-react';

export default function TodaysWorkout() {
  const { todaySession, loading } = useWorkout();

  if (loading) {
    return (
      <div className="fluetas-card p-4 flex flex-col gap-3">
        <div className="h-3 w-24 bg-[#1E2133] rounded animate-pulse" />
        <div className="h-16 bg-[#1E2133] rounded-xl animate-pulse" />
        <div className="h-8 bg-[#1E2133] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!todaySession) {
    return (
      <div className="fluetas-card p-4 flex flex-col justify-between gap-3 min-h-[160px]">
        <span className="section-title">TODAY'S WORKOUT</span>
        <div className="flex flex-col items-center text-center py-3 flex-1 justify-center">
          <p className="text-3xl mb-2">🏋️</p>
          <p className="text-xs font-semibold text-[#E8EAF6] m-0">No workout yet</p>
          <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-1">Start a session to track your training</p>
        </div>
        <Link
          href="/fluetas-train"
          id="start-workout-btn"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold hover:opacity-90 transition-all no-underline shadow-[0_0_12px_rgba(16,185,129,0.25)]"
        >
          <Play size={13} fill="currentColor" />
          Start Today's Workout
        </Link>
      </div>
    );
  }

  const isCompleted = todaySession.status === 'completed';
  const isActive = todaySession.status === 'active';
  const completionPct = todaySession.totalSets
    ? Math.round((todaySession.completedSets! / todaySession.totalSets) * 100)
    : 0;

  return (
    <div className="fluetas-card p-4 flex flex-col gap-3 min-h-[160px]">
      <div className="flex items-center justify-between">
        <span className="section-title">TODAY'S WORKOUT</span>
        <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${
          isCompleted
            ? 'bg-[#10B981]/15 text-[#10B981]'
            : 'bg-[#38BDF8]/15 text-[#38BDF8]'
        }`}>
          {isCompleted ? 'Completed' : 'Active'}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#38BDF8]/15 text-[#38BDF8]'}`}>
          {isCompleted ? <CheckCircle2 size={20} /> : <Dumbbell size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0 truncate">
            {todaySession.workoutName}
          </p>
          <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-0.5">
            {todaySession.completedSets ?? 0}/{todaySession.totalSets ?? 0} sets
          </p>
          {isActive && (
            <div className="mt-1.5 h-1.5 rounded-full bg-[#1E2133] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0284C7] transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <Link
        href="/fluetas-train"
        className="flex items-center justify-center gap-2 py-2 rounded-xl border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] hover:border-[#2A3050] text-xs font-semibold transition-all no-underline"
      >
        {isActive ? 'Continue Workout →' : 'View History →'}
      </Link>
    </div>
  );
}
