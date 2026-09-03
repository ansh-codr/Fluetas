'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { getHydrationTrend } from '@/lib/services/hydrationService';
import { getSleepTrend } from '@/lib/services/sleepService';
import { getNutritionTrend } from '@/lib/services/nutritionService';
import { TrendingUp, Plus, Droplets, Moon, Utensils } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from '@/components/motion/MotionUtils';

interface NormalizedTrendPoint {
  day: string;
  date: string;
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
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 2 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="bg-[#FFFFFF] border border-[rgba(18,22,15,0.12)] rounded-xl p-3 text-xs shadow-lg backdrop-blur-md"
    >
      <p className="font-bold text-[#12160F] mb-1.5 font-['Outfit']">{label}</p>
      <div className="space-y-1.5 min-w-[170px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#586151] flex items-center gap-1.5 text-[0.72rem]">
            <span className="w-2 h-2 rounded-sm bg-[#2E6DA4]" />
            Hydration:
          </span>
          <span className="font-bold text-[#12160F] text-xs">
            {item.rawHydration}L <span className="text-[#586151] font-normal">({item.hydrationPct}%)</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#586151] flex items-center gap-1.5 text-[0.72rem]">
            <span className="w-2 h-2 rounded-sm bg-[#7A4E9E]" />
            Sleep:
          </span>
          <span className="font-bold text-[#12160F] text-xs">
            {item.rawSleep}h <span className="text-[#586151] font-normal">({item.sleepPct}%)</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#586151] flex items-center gap-1.5 text-[0.72rem]">
            <span className="w-2 h-2 rounded-sm bg-[#2E7D32]" />
            Nutrition:
          </span>
          <span className="font-bold text-[#12160F] text-xs">
            {item.rawCalories} kcal <span className="text-[#586151] font-normal">({item.nutritionPct}%)</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function WeeklyProgressChart() {
  const { user } = useAuth();
  const [daysRange, setDaysRange] = useState<7 | 30>(7);
  const [data, setData] = useState<NormalizedTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      getHydrationTrend(user.uid, daysRange),
      getSleepTrend(user.uid, daysRange),
      getNutritionTrend(user.uid, daysRange),
    ])
      .then(([hydrTrend, sleepTrend, nutrTrend]) => {
        const combined: NormalizedTrendPoint[] = hydrTrend.days.map((h, i) => {
          const s = sleepTrend.days[i];
          const n = nutrTrend.days[i];

          const rawH = Math.round((h.totalMl / 1000) * 10) / 10;
          const rawS = s ? Math.round(s.durationHrs * 10) / 10 : 0;
          const rawC = n ? n.calories : 0;

          const hydrPct = Math.min(100, Math.round((h.totalMl / (h.targetMl || 2500)) * 100));
          const slpPct = Math.min(100, Math.round((rawS / 8) * 100));
          const nutrPct = Math.min(100, Math.round((rawC / 2200) * 100));

          return {
            day: daysRange === 7 ? h.dayLabel : `${new Date(h.date).getDate()}/${new Date(h.date).getMonth() + 1}`,
            date: h.date,
            hydrationPct: hydrPct,
            sleepPct: slpPct,
            nutritionPct: nutrPct,
            rawHydration: rawH,
            rawSleep: rawS,
            rawCalories: rawC,
          };
        });

        setData(combined);
        setLoading(false);
      })
      .catch(err => {
        console.warn('[WeeklyProgressChart] Failed to load trends:', err);
        setLoading(false);
      });
  }, [user, daysRange]);

  const hasData = data.some(d => d.rawHydration > 0 || d.rawSleep > 0 || d.rawCalories > 0);

  return (
    <div className="fluetas-card p-4 sm:p-5 bg-[#FFFFFF] h-full flex flex-col justify-between border border-[rgba(18,22,15,0.08)] shadow-sm">
      {/* Header & Range Switcher */}
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
            <TrendingUp size={15} />
          </div>
          <div>
            <span className="section-title">Telemetry Goal Adherence</span>
            <span className="text-[0.65rem] text-[#8A9482] block">
              Normalized daily target completion (%)
            </span>
          </div>
        </div>

        {/* 7-Day vs 30-Day Range Toggle */}
        <div className="flex items-center bg-[#F2F4EE] p-0.5 rounded-lg border border-[rgba(18,22,15,0.08)]">
          <button
            onClick={() => setDaysRange(7)}
            className={`px-2.5 py-1 rounded-md text-[0.68rem] font-bold transition-all cursor-pointer ${
              daysRange === 7
                ? 'bg-[#FFFFFF] text-[#12160F] shadow-xs'
                : 'text-[#586151] hover:text-[#12160F]'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDaysRange(30)}
            className={`px-2.5 py-1 rounded-md text-[0.68rem] font-bold transition-all cursor-pointer ${
              daysRange === 30
                ? 'bg-[#FFFFFF] text-[#12160F] shadow-xs'
                : 'text-[#586151] hover:text-[#12160F]'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="h-[210px] bg-[#FAFAF6] rounded-xl animate-pulse flex flex-col items-center justify-center border border-[rgba(18,22,15,0.06)] gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E5E9DF] animate-bounce" />
          <span className="text-xs text-[#586151] font-medium">Aggregating telemetry trends...</span>
        </div>
      ) : !hasData ? (
        /* Empty State with Muted Outline Guide */
        <div className="h-[210px] flex flex-col items-center justify-center text-center p-5 bg-[#FAFAF6] rounded-xl border border-dashed border-[rgba(18,22,15,0.15)] relative overflow-hidden">
          {/* Subtle Dotted Muted Bars in Background */}
          <div className="absolute inset-0 opacity-15 flex items-end justify-around px-6 pb-4 pointer-events-none">
            {[40, 65, 30, 80, 55, 90, 70].map((h, idx) => (
              <div
                key={idx}
                className="w-5 bg-[#2E7D32] rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[rgba(18,22,15,0.10)] flex items-center justify-center text-[#2E7D32] mb-2 shadow-xs">
              <TrendingUp size={16} />
            </div>
            <p className="text-xs font-bold text-[#12160F] m-0">Log your first telemetry to see your week</p>
            <p className="text-[0.68rem] text-[#586151] m-0 mt-1 max-w-xs leading-relaxed">
              Record hydration, sleep, or meals to unlock your personalized progress trend.
            </p>

            {/* Quick Action Pills */}
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/hydration"
                className="px-2.5 py-1 rounded-lg bg-white border border-[rgba(18,22,15,0.12)] text-[0.68rem] font-bold text-[#2E6DA4] hover:border-[#2E6DA4] flex items-center gap-1 transition-colors no-underline shadow-2xs"
              >
                <Droplets size={11} /> +Hydration
              </Link>
              <Link
                href="/sleep"
                className="px-2.5 py-1 rounded-lg bg-white border border-[rgba(18,22,15,0.12)] text-[0.68rem] font-bold text-[#7A4E9E] hover:border-[#7A4E9E] flex items-center gap-1 transition-colors no-underline shadow-2xs"
              >
                <Moon size={11} /> +Sleep
              </Link>
              <Link
                href="/nutrition"
                className="px-2.5 py-1 rounded-lg bg-white border border-[rgba(18,22,15,0.12)] text-[0.68rem] font-bold text-[#2E7D32] hover:border-[#2E7D32] flex items-center gap-1 transition-colors no-underline shadow-2xs"
              >
                <Utensils size={11} /> +Meal
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Real Interactive Recharts Visualization with Staggered Height Animation */
        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
              onMouseMove={(state) => {
                if (state.activeTooltipIndex !== undefined) {
                  setActiveHoverIdx(Number(state.activeTooltipIndex));
                }
              }}
              onMouseLeave={() => setActiveHoverIdx(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,22,15,0.06)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#586151' }}
                axisLine={{ stroke: 'rgba(18,22,15,0.10)' }}
                tickLine={false}
                interval={daysRange === 30 ? 4 : 0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: '#8A9482' }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 50, 100]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(46,125,50,0.04)', radius: 6 }} />

              <Bar
                dataKey="hydrationPct"
                name="Hydration"
                fill="#2E6DA4"
                radius={[4, 4, 0, 0]}
                maxBarSize={daysRange === 30 ? 6 : 14}
                isAnimationActive={!shouldReduceMotion}
                animationDuration={400}
                animationEasing="ease-out"
              >
                {data.map((_, idx) => (
                  <Cell
                    key={`hydr-${idx}`}
                    fill="#2E6DA4"
                    opacity={activeHoverIdx === null || activeHoverIdx === idx ? 1 : 0.4}
                    style={{ transition: 'opacity 0.15s ease' }}
                  />
                ))}
              </Bar>

              <Bar
                dataKey="sleepPct"
                name="Sleep"
                fill="#7A4E9E"
                radius={[4, 4, 0, 0]}
                maxBarSize={daysRange === 30 ? 6 : 14}
                isAnimationActive={!shouldReduceMotion}
                animationDuration={400}
                animationEasing="ease-out"
              >
                {data.map((_, idx) => (
                  <Cell
                    key={`sleep-${idx}`}
                    fill="#7A4E9E"
                    opacity={activeHoverIdx === null || activeHoverIdx === idx ? 1 : 0.4}
                    style={{ transition: 'opacity 0.15s ease' }}
                  />
                ))}
              </Bar>

              <Bar
                dataKey="nutritionPct"
                name="Nutrition"
                fill="#2E7D32"
                radius={[4, 4, 0, 0]}
                maxBarSize={daysRange === 30 ? 6 : 14}
                isAnimationActive={!shouldReduceMotion}
                animationDuration={400}
                animationEasing="ease-out"
              >
                {data.map((_, idx) => (
                  <Cell
                    key={`nutr-${idx}`}
                    fill="#2E7D32"
                    opacity={activeHoverIdx === null || activeHoverIdx === idx ? 1 : 0.4}
                    style={{ transition: 'opacity 0.15s ease' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Interactive Legend Pills */}
      <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-[rgba(18,22,15,0.06)] text-[0.68rem] text-[#586151]">
        <Link href="/hydration" className="flex items-center gap-1.5 hover:text-[#2E6DA4] transition-colors no-underline">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E6DA4]" />
          Hydration
        </Link>
        <Link href="/sleep" className="flex items-center gap-1.5 hover:text-[#7A4E9E] transition-colors no-underline">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7A4E9E]" />
          Sleep
        </Link>
        <Link href="/nutrition" className="flex items-center gap-1.5 hover:text-[#2E7D32] transition-colors no-underline">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
          Nutrition
        </Link>
      </div>
    </div>
  );
}
