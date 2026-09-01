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
      <div className="fluetas-card p-4 flex flex-col gap-3 min-h-[170px]">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-full h-14" />
        <Skeleton className="w-full h-8" />
      </div>
    );
  }

  if (!todaySession) {
    return (
      <div className="fluetas-card-interactive p-4 flex flex-col justify-between gap-3 min-h-[170px] group">
        <div className="flex items-center justify-between">
          <span className="section-title">TODAY&apos;S WORKOUT</span>
          <span className="text-base group-hover:scale-110 transition-transform">🏋️</span>
        </div>
        <div className="flex flex-col items-center text-center py-2 flex-1 justify-center">
          <p className="text-xs font-semibold text-[#E8EAF6] m-0">No active session</p>
          <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-0.5">Start daily resistance training</p>
        </div>
        <Link
          href="/fluetas-train"
          id="start-workout-btn"
          className="flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold hover:opacity-90 transition-all no-underline shadow-[0_0_12px_rgba(16,185,129,0.25)]"
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
    <div className="fluetas-card-interactive p-4 flex flex-col justify-between gap-3 min-h-[170px] group">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="section-title">TODAY&apos;S WORKOUT</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${
              isCompleted
                ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
            }`}
          >
            {isCompleted ? '✓ Done' : 'In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Animated Ring Indicator */}
          <AnimatedRing
            size={46}
            strokeWidth={4.5}
            progress={isCompleted ? 100 : completionPct}
            color={isCompleted ? '#10B981' : '#38BDF8'}
            trackColor={isCompleted ? '#10B98125' : '#38BDF820'}
          >
            <span className="text-[0.65rem] font-bold font-mono">
              <AnimatedNumber value={isCompleted ? 100 : completionPct} suffix="%" duration={600} />
            </span>
          </AnimatedRing>

          <div className="flex-1 min-w-0">
            <p className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0 truncate">
              {todaySession.workoutName}
            </p>
            <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-0.5">
              <AnimatedNumber value={completedSets} /> / {totalSets} sets completed
            </p>
            {isCompleted && (
              <p className="text-[0.62rem] text-[#10B981] font-semibold m-0 mt-0.5">
                Great work today.
              </p>
            )}
          </div>
        </div>
      </div>

      <Link
        href="/fluetas-train"
        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all no-underline ${
          isActive
            ? 'bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/25 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
            : 'border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] hover:border-[#2A3050]'
        }`}
      >
        <span>{isActive ? 'Continue Workout' : 'View Training Plan'}</span>
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
