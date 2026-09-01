'use client';

import React from 'react';
import Link from 'next/link';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import { useHydration } from '@/hooks/useHydration';
import { useSleep } from '@/hooks/useSleep';
import { useWorkout } from '@/hooks/useWorkout';
import { Sparkles } from 'lucide-react';

export default function AICoachCard() {
  const { result: wellness } = useWellnessScore();
  const { totalMl, goalMl } = useHydration();
  const { todaySleep } = useSleep();
  const { todaySession } = useWorkout();

  // Generate real data-driven dynamic insight
  let dynamicInsight = 'Welcome to FLUETAS AI Coach. Log your daily hydration, sleep, and workouts so I can provide customized recovery and nutrition guidance.';

  if (wellness && !wellness.insufficientData) {
    if (totalMl < goalMl * 0.5) {
      dynamicInsight = `You have reached ${Math.round((totalMl / goalMl) * 100)}% of your hydration target. Consider having 500ml of water before your next activity to maintain peak focus.`;
    } else if (todaySleep && todaySleep.durationHrs < 7) {
      dynamicInsight = `You logged ${todaySleep.durationHrs}h of sleep last night. We recommend lower training intensity today with emphasis on active mobility and hydration.`;
    } else if (todaySession?.status === 'completed') {
      dynamicInsight = `Great job finishing your workout today! Prioritize 25-30g of post-workout protein within the next 45 minutes to optimize muscle recovery.`;
    } else {
      dynamicInsight = `Your wellness score is trending well today. Keep your hydration steady and prepare for tonight's restful sleep protocol.`;
    }
  }

  return (
    <div className="fluetas-card p-4 bg-gradient-to-br from-[#13161F] to-[#1a1030] border-[#A78BFA]/20 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#A78BFA]" />
            <span className="section-title">AI COACH INSIGHT</span>
          </div>
          <Link
            href="/ai-coach"
            className="text-[#A78BFA] text-xs font-semibold hover:underline no-underline"
          >
            Ask AI &gt;
          </Link>
        </div>

        <div className="flex gap-3 mb-3.5">
          {/* Bot avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] flex items-center justify-center text-xl shrink-0 shadow-[0_0_16px_rgba(124,58,237,0.4)]">
            🤖
          </div>
          <p className="text-[#E8EAF6] text-xs leading-relaxed m-0">
            {dynamicInsight}
          </p>
        </div>
      </div>

      <Link
        href="/ai-coach"
        id="ai-coach-chat-btn"
        className="btn-primary w-full justify-center text-center no-underline text-xs font-bold py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:opacity-90 transition-all"
      >
        🤖 Talk to FLUETAS AI Coach
      </Link>
    </div>
  );
}
