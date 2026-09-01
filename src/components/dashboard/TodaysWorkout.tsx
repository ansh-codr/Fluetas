'use client';

import React from 'react';
import Link from 'next/link';
import { useWorkout } from '@/hooks/useWorkout';
import { Play, CheckCircle2, Dumbbell, ArrowRight } from 'lucide-react';
import { AnimatedNumber, AnimatedRing, Skeleton } from '@/components/motion/MotionUtils';

export default function TodaysWorkout() {
  const { todaySession, loading } = useWorkout();

  if (loading) {
    return (
      <div className="fluetas-card p-4 sm:p-4.5 flex flex-col gap-3 min-h-[170px] bg-[#FFFFFF]">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-full h-14 rounded-xl" />
        <Skeleton className="w-full h-8 rounded-xl" />
      </div>
    );
  }

  if (!todaySession) {
    return (
      <div className="fluetas-card p-4 sm:p-4.5 flex flex-col justify-between gap-3 min-h-[170px] bg-[#FFFFFF]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Dumbbell size={13} className="text-[#2E7D32]" />
            <span className="section-title">Today&apos;s Workout</span>
          </div>
          <span className="text-xs text-[#8A9482]">Plan</span>
        </div>
        <div className="flex flex-col items-center text-center py-2 flex-1 justify-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
          <p className="text-xs font-bold text-[#12160F] m-0">Upper Body Power</p>
          <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5">4 exercises · 35 min estimated</p>
        </div>
        <Link
          href="/workouts"
          id="start-workout-btn"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2E7D32] text-[#FAFAF6] text-xs font-bold hover:bg-[#256628] transition-all no-underline shadow-xs hover:shadow-sm"
        >
          <Play size={13} fill="currentColor" />
          Start Workout
        </Link>
      </div>
    );
  }

  const isCompleted = todaySession.status === 'completed';
  const isActive = todaySession.status === 'active';
  const totalSets = todaySession.totalSets || 12;
  const completedSets = todaySession.completedSets || 0;
  const completionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="fluetas-card p-4 sm:p-4.5 flex flex-col justify-between gap-3 min-h-[170px] bg-[#FFFFFF]">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Dumbbell size={13} className="text-[#2E7D32]" />
            <span className="section-title">Today&apos;s Workout</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${
              isCompleted
                ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                : 'bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/20'
            }`}
          >
            {isCompleted ? '✓ Done' : 'In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AnimatedRing
            size={46}
            strokeWidth={4.5}
            progress={isCompleted ? 100 : completionPct}
            color={isCompleted ? '#2E7D32' : '#2E6DA4'}
            trackColor={isCompleted ? '#2E7D3220' : '#2E6DA420'}
          >
            <span className="text-[0.65rem] font-bold font-mono text-[#12160F]">
              <AnimatedNumber value={isCompleted ? 100 : completionPct} suffix="%" duration={600} />
            </span>
          </AnimatedRing>

          <div className="flex-1 min-w-0">
            <p className="font-['Outfit'] text-sm font-bold text-[#12160F] m-0 truncate">
              {todaySession.workoutName}
            </p>
            <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5">
              <AnimatedNumber value={completedSets} /> / {totalSets} sets completed
            </p>
            {isCompleted && (
              <p className="text-[0.62rem] text-[#2E7D32] font-semibold m-0 mt-0.5">
                Session complete
              </p>
            )}
          </div>
        </div>
      </div>

      <Link
        href="/workouts"
        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all no-underline ${
          isActive
            ? 'bg-[#2E6DA4]/10 border border-[#2E6DA4]/30 text-[#2E6DA4] hover:bg-[#2E6DA4]/20'
            : 'border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] hover:bg-[#FAFAF6]'
        }`}
      >
        <span>{isActive ? 'Continue Workout' : 'View Workout'}</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
