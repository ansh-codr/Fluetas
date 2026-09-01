'use client';

import React from 'react';
import CircleProgress from '@/components/ui/CircleProgress';
import ProgressBar from '@/components/ui/ProgressBar';
import { mockSleepSummary, mockSleepWeek } from '@/lib/mock/dashboardData';
import {
  Moon,
  Sparkles,
  TrendingUp,
  Activity,
  Heart,
  Clock,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SleepPage() {
  const { score, duration, target, efficiency, asleepTime, wakeTime, stages, hrvAverage, restingHR } = mockSleepSummary;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
          SLEEP ARCHITECTURE & CIRCADIAN RECOVERY
        </h1>
        <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
          Biometric sleep tracking, autonomic nervous system recovery (HRV), and stage analysis.
        </p>
      </div>

      {/* Main Sleep Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quality Score Ring */}
        <div className="fluetas-card p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#13161F] to-[#1E1136] border-[#A78BFA]/30">
          <CircleProgress
            score={score}
            max={100}
            size={140}
            strokeWidth={10}
            color="#A78BFA"
            trackColor="#3B0764"
            label={`${score}`}
          />
          <div className="mt-3">
            <p className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
              Optimal Recovery Score
            </p>
            <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
              Efficiency: {efficiency} · Asleep at {asleepTime}
            </p>
          </div>
        </div>

        {/* Biometrics Matrix */}
        <div className="fluetas-card p-5 md:col-span-2 flex flex-col justify-between gap-4">
          <span className="section-title">LAST NIGHT&apos;S BIOMETRIC VITALS</span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl">
              <span className="text-[0.65rem] text-[#8B91B0] block mb-1">Total Duration</span>
              <p className="font-['Outfit'] font-bold text-base text-[#E8EAF6] m-0">{duration}</p>
              <span className="text-[0.65rem] text-[#10B981] font-semibold">Goal: {target}</span>
            </div>

            <div className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl">
              <span className="text-[0.65rem] text-[#8B91B0] block mb-1">Heart Rate (RHR)</span>
              <p className="font-['Outfit'] font-bold text-base text-[#E8EAF6] m-0">{restingHR}</p>
              <span className="text-[0.65rem] text-[#10B981] font-semibold">Low & Restful</span>
            </div>

            <div className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl">
              <span className="text-[0.65rem] text-[#8B91B0] block mb-1">HRV (Recovery)</span>
              <p className="font-['Outfit'] font-bold text-base text-[#E8EAF6] m-0">{hrvAverage}</p>
              <span className="text-[0.65rem] text-[#10B981] font-semibold">+6ms vs baseline</span>
            </div>

            <div className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl">
              <span className="text-[0.65rem] text-[#8B91B0] block mb-1">Wake Time</span>
              <p className="font-['Outfit'] font-bold text-base text-[#E8EAF6] m-0">{wakeTime}</p>
              <span className="text-[0.65rem] text-[#8B91B0]">Circadian Align</span>
            </div>
          </div>

          {/* Horizontal Stacked Sleep Stage Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#8B91B0] mb-2">
              <span className="font-semibold text-[#E8EAF6]">Sleep Stages Breakdown</span>
              <span>Deep: {stages.deep.time} · REM: {stages.rem.time}</span>
            </div>

            {/* Stacked bar */}
            <div className="h-5 rounded-full overflow-hidden flex w-full bg-[#1E2133]">
              <div style={{ width: `${stages.deep.pct}%` }} className="bg-[#7C3AED]" title="Deep Sleep" />
              <div style={{ width: `${stages.rem.pct}%` }} className="bg-[#A78BFA]" title="REM Sleep" />
              <div style={{ width: `${stages.light.pct}%` }} className="bg-[#38BDF8]" title="Light Sleep" />
              <div style={{ width: `${stages.awake.pct}%` }} className="bg-[#F472B6]" title="Awake" />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[0.68rem] text-[#8B91B0] mt-2 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                <span>Deep ({stages.deep.pct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]" />
                <span>REM ({stages.rem.pct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span>Light ({stages.light.pct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F472B6]" />
                <span>Awake ({stages.awake.pct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Sleep Duration Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#A78BFA]" />
            <span className="section-title">7-DAY SLEEP DURATION & QUALITY TREND</span>
          </div>
          <span className="text-xs text-[#A78BFA] font-bold">Average: 7.6 hrs / night</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockSleepWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" vertical={false} />
              <XAxis dataKey="day" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} unit="h" />
              <Tooltip
                contentStyle={{ backgroundColor: '#13161F', borderColor: '#1E2133', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="duration" name="Sleep Duration (hrs)" fill="#A78BFA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
