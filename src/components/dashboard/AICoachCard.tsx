'use client';

import React from 'react';
import Link from 'next/link';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import { useHydration } from '@/hooks/useHydration';
import { useSleep } from '@/hooks/useSleep';
import { useWorkout } from '@/hooks/useWorkout';
import { Sparkles, Bot, ArrowRight } from 'lucide-react';

export default function AICoachCard() {
  const { result: wellness } = useWellnessScore();
  const { totalMl, goalMl } = useHydration();
  const { todaySleep } = useSleep();
  const { todaySession } = useWorkout();

  // Generate data-driven wellness guidance based on real inputs
  let dynamicInsight = 'Log your daily hydration, sleep, and workouts so I can provide contextual wellness insights and habit reminders.';

  if (wellness && !wellness.insufficientData) {
    if (totalMl < goalMl * 0.5) {
      dynamicInsight = `You have reached ${Math.round((totalMl / goalMl) * 100)}% of your hydration target. Consider having a glass of water before your next activity to maintain steady energy.`;
    } else if (todaySleep && todaySleep.durationHrs < 7) {
      dynamicInsight = `You logged ${todaySleep.durationHrs}h of sleep last night. Consider a lighter training session if you feel fatigued today and prioritize early rest.`;
    } else if (todaySession?.status === 'completed') {
      dynamicInsight = `Workout logged for today! Ensure you have an adequate protein-rich meal and hydrate well to support natural muscle recovery.`;
    } else {
      dynamicInsight = `Your daily telemetry is tracking nicely. Maintain consistent hydration and follow your evening wind-down routine.`;
    }
  }

  return (
    <div className="fluetas-card p-4 sm:p-4.5 bg-[#FFFFFF] border-[rgba(122,78,158,0.20)] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#7A4E9E]" />
            <span className="section-title">AI Insight</span>
          </div>
          <span className="text-[0.62rem] font-bold text-[#7A4E9E] bg-[#7A4E9E]/10 px-2 py-0.5 rounded-full border border-[#7A4E9E]/20">
            AI-generated wellness insight
          </span>
        </div>

        <div className="flex gap-3 my-3 p-3 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
          <div className="w-9 h-9 rounded-xl bg-[#7A4E9E] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Bot size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[#12160F] text-xs leading-relaxed m-0">
              {dynamicInsight}
            </p>
            <p className="text-[0.62rem] text-[#8A9482] mt-1.5 m-0 italic">
              Non-clinical wellness guidance. Not a substitute for professional medical care.
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/ai-coach"
        id="ai-coach-chat-btn"
        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#7A4E9E] hover:bg-[#6A3E8E] text-[#FAFAF6] text-xs font-semibold text-center no-underline shadow-xs hover:shadow-sm transition-all"
      >
        <Sparkles size={13} />
        <span>Ask AI Coach</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
