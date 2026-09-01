'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { getWeeklySleep } from '@/lib/services/sleepService';
import { getWeeklyHydration } from '@/lib/services/hydrationService';
import { getWeeklyNutrition } from '@/lib/services/nutritionService';
import { TrendingUp } from 'lucide-react';

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

interface NormalizedTrendPoint {
  day: string;
  hydrationPct: number;
  sleepPct: number;
  nutritionPct: number;
  rawHydration: number;
  rawSleep: number;
  rawCalories: number;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload: NormalizedTrendPoint }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;

  return (
    <div className="bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] rounded-xl p-3 text-xs shadow-md">
      <p className="font-bold text-[#12160F] mb-1.5 font-['Outfit']">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#586151] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#2E6DA4]" />
            Hydration:
          </span>
          <span className="font-semibold text-[#12160F]">
            {item.rawHydration}L ({item.hydrationPct}%)
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#586151] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#7A4E9E]" />
            Sleep:
          </span>
          <span className="font-semibold text-[#12160F]">
            {item.rawSleep}h ({item.sleepPct}%)
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#586151] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#2E7D32]" />
            Nutrition:
          </span>
          <span className="font-semibold text-[#12160F]">
            {item.rawCalories} kcal ({item.nutritionPct}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default function WeeklyProgressChart() {
  const { user } = useAuth();
  const [data, setData] = useState<NormalizedTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([
      getWeeklyHydration(user.uid),
      getWeeklySleep(user.uid),
      getWeeklyNutrition(user.uid),
    ])
      .then(([hydr, sleep, nutr]) => {
        const combined: NormalizedTrendPoint[] = hydr.map((h, i) => {
          const rawH = Math.round(h.totalMl / 100) / 10;
          const rawS = sleep[i]?.durationHrs ?? 0;
          const rawC = nutr[i]?.calories ?? 0;

          return {
            day: dayLabel(h.date),
            hydrationPct: Math.min(100, Math.round((h.totalMl / 2500) * 100)),
            sleepPct: Math.min(100, Math.round((rawS / 8) * 100)),
            nutritionPct: Math.min(100, Math.round((rawC / 2200) * 100)),
            rawHydration: rawH,
            rawSleep: rawS,
            rawCalories: rawC,
          };
        });
        setData(combined);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user]);

  const hasData = data.some(d => d.rawHydration > 0 || d.rawSleep > 0 || d.rawCalories > 0);

  return (
    <div className="fluetas-card p-4 sm:p-4.5 bg-[#FFFFFF] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-[#2E7D32]" />
          <span className="section-title">Weekly Goal Completion</span>
        </div>
        <span className="text-[0.65rem] text-[#586151] font-medium bg-[#FAFAF6] px-2 py-0.5 rounded-full border border-[rgba(18,22,15,0.06)]">
          Normalized %
        </span>
      </div>

      {loading ? (
        <div className="h-[180px] bg-[#FAFAF6] rounded-xl animate-pulse flex items-center justify-center border border-[rgba(18,22,15,0.06)]">
          <span className="text-xs text-[#586151]">Loading telemetry trends...</span>
        </div>
      ) : !hasData ? (
        <div className="h-[180px] flex flex-col items-center justify-center text-center p-4 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
          <div className="w-10 h-10 rounded-full bg-[#E8ECE2] flex items-center justify-center text-[#586151] mb-2">
            <TrendingUp size={18} />
          </div>
          <p className="text-xs font-bold text-[#12160F] m-0">No weekly telemetry logged yet</p>
          <p className="text-[0.6875rem] text-[#586151] m-0 mt-1 max-w-xs">
            As you log daily hydration, sleep, and workouts, your 7-day normalized goal adherence appears here.
          </p>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col justify-end">
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={data} barGap={3} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,22,15,0.06)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#586151', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#8A9482', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit="%"
                width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(18,22,15,0.03)' }} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: '0.70rem', color: '#586151', paddingTop: 6 }}
              />
              <Bar
                name="Hydration %"
                dataKey="hydrationPct"
                fill="#2E6DA4"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              />
              <Bar
                name="Sleep %"
                dataKey="sleepPct"
                fill="#7A4E9E"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              />
              <Bar
                name="Nutrition %"
                dataKey="nutritionPct"
                fill="#2E7D32"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
