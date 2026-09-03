'use client';

import React, { useState } from 'react';
import CircleProgress from '@/components/ui/CircleProgress';
import { useHydration } from '@/hooks/useHydration';
import {
  Droplets,
  Plus,
  CheckCircle2,
  TrendingUp,
  Loader2,
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

const DRINK_OPTIONS = [
  { label: 'Water', emoji: '💧', amount: 250, type: 'Pure Filtered Water' },
  { label: 'Large', emoji: '🥤', amount: 500, type: 'Pure Filtered Water' },
  { label: 'Green Tea', emoji: '🍵', amount: 200, type: 'Green Tea' },
  { label: 'Coffee', emoji: '☕', amount: 150, type: 'Coffee (Black)' },
  { label: 'Coconut', emoji: '🥥', amount: 300, type: 'Coconut Water' },
  { label: 'Custom', emoji: '✏️', amount: 0, type: 'Pure Filtered Water' },
];

function formatTime(ts: { seconds: number }): string {
  return new Date(ts.seconds * 1000).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

export default function HydrationPage() {
  const { logs, totalMl, goalMl, pct, weeklyData, loading, error, addWater, submitting } = useHydration();

  const [customAmount, setCustomAmount] = useState(300);
  const [customType, setCustomType] = useState('Pure Filtered Water');
  const [showCustom, setShowCustom] = useState(false);

  const handleQuickAdd = async (amount: number, type: string) => {
    if (amount === 0) { setShowCustom(true); return; }
    await addWater(amount, type);
  };

  const handleCustomAdd = async () => {
    if (customAmount < 1 || customAmount > 5000) return;
    await addWater(customAmount, customType);
    setShowCustom(false);
  };

  const weeklyChartData = weeklyData.map(d => ({
    day: dayLabel(d.date),
    ml: Math.round(d.totalMl),
    L: Math.round(d.totalMl / 100) / 10,
    date: d.date,
  }));

  const weeklyAvg = weeklyData.length
    ? Math.round(weeklyData.reduce((a, d) => a + d.totalMl, 0) / (weeklyData.filter(d => d.totalMl > 0).length || 1))
    : 0;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
          DAILY HYDRATION TRACKER
        </h1>
        <p className="text-[#586151] text-xs sm:text-sm m-0">
          Real-time fluid intake, electrolyte balance, and cellular hydration insights.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Main Score + Quick Add */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Ring */}
        <div className="fluetas-card p-6 flex flex-col items-center justify-center gap-3 bg-white border border-[rgba(18,22,15,0.10)] text-center">
          {loading ? (
            <div className="w-36 h-36 rounded-full bg-[#F2F4EE] animate-pulse" />
          ) : (
            <>
              <CircleProgress
                score={pct}
                max={100}
                size={140}
                strokeWidth={10}
                color="#2E6DA4"
                trackColor="rgba(46,109,164,0.12)"
                label={`${pct}%`}
                labelColor="#12160F"
              />
              <div>
                <p className="font-['Outfit'] text-2xl font-black text-[#2E6DA4] m-0">
                  {(totalMl / 1000).toFixed(1)}L
                </p>
                <p className="text-[#586151] text-xs m-0">
                  of {(goalMl / 1000).toFixed(1)}L daily goal
                </p>
                {pct >= 100 && (
                  <div className="flex items-center justify-center gap-1 mt-1.5 text-[#2E7D32] text-xs font-bold">
                    <CheckCircle2 size={14} /> Goal reached! 🎉
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Quick Add Buttons */}
        <div className="fluetas-card p-5 md:col-span-2 flex flex-col gap-4">
          <span className="section-title">QUICK ADD</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {DRINK_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleQuickAdd(opt.amount, opt.type)}
                disabled={submitting}
                id={`hydration-add-${opt.label.toLowerCase()}`}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-[rgba(18,22,15,0.10)] bg-[#F2F4EE] hover:border-[#2E6DA4] hover:bg-[#F4F8FC] transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-[0.65rem] font-semibold text-[#12160F]">{opt.label}</span>
                {opt.amount > 0 && (
                  <span className="text-[0.6rem] text-[#2E6DA4] font-bold">+{opt.amount}ml</span>
                )}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          {showCustom && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-[#F2F4EE] border border-[rgba(18,22,15,0.08)] rounded-xl animate-slide-up">
              <input
                type="number"
                min={1} max={5000}
                value={customAmount}
                onChange={e => setCustomAmount(Number(e.target.value))}
                className="bg-white border border-[rgba(18,22,15,0.15)] rounded-lg px-3 py-2 text-[#12160F] text-sm w-28 focus:border-[#2E6DA4] focus:outline-none"
                placeholder="ml"
              />
              <input
                value={customType}
                onChange={e => setCustomType(e.target.value)}
                placeholder="Drink type"
                className="flex-1 bg-white border border-[rgba(18,22,15,0.15)] rounded-lg px-3 py-2 text-[#12160F] text-sm focus:border-[#2E6DA4] focus:outline-none"
              />
              <button
                onClick={handleCustomAdd}
                disabled={submitting || customAmount < 1 || customAmount > 5000}
                className="btn-primary px-4 py-2 text-sm font-bold disabled:opacity-50 cursor-pointer hover:opacity-90 transition-all flex items-center gap-1.5 justify-center"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </button>
              <button onClick={() => setShowCustom(false)} className="px-3 py-2 rounded-lg border border-[rgba(18,22,15,0.10)] text-[#586151] text-sm hover:text-[#12160F] cursor-pointer">
                Cancel
              </button>
            </div>
          )}

          {/* Adjust goal hint */}
          <div className="flex items-center justify-between text-xs text-[#586151]">
            <span>Remaining: <span className="text-[#2E6DA4] font-bold">{Math.max(0, goalMl - totalMl)} ml</span></span>
            <span>Goal set in <a href="/profile" className="text-[#2E7D32] hover:underline">Profile</a></span>
          </div>
        </div>
      </div>

      {/* Today's Log Timeline */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="section-title">TODAY&apos;S LOG ({logs.length} entries)</span>
          <span className="text-xs text-[#2E6DA4] font-semibold">{totalMl} ml total</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-11 bg-[#F2F4EE] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-3xl mb-2">💧</p>
            <p className="font-semibold text-[#12160F] text-sm m-0">No water logged yet today</p>
            <p className="text-[#586151] text-xs m-0 mt-1">Use the quick-add buttons above to start tracking.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2E6DA4]/10 flex items-center justify-center">
                    <Droplets size={14} className="text-[#2E6DA4]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#12160F] m-0">{log.type}</p>
                    <p className="text-[0.65rem] text-[#586151] m-0">{formatTime(log.timestamp as { seconds: number })}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#2E6DA4]">+{log.amount} ml</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7-Day Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#2E6DA4]" />
            <span className="section-title">7-DAY HYDRATION TREND</span>
          </div>
          {weeklyAvg > 0 && (
            <span className="text-xs text-[#2E6DA4] font-bold">
              Avg: {(weeklyAvg / 1000).toFixed(1)}L / day
            </span>
          )}
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,22,15,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="#8A9482" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A9482" fontSize={11} tickLine={false} axisLine={false} unit="L" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(18,22,15,0.15)', borderRadius: '12px', color: '#12160F', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(val: any) => [`${(Number(val || 0) / 1000).toFixed(1)}L`, 'Intake']}
              />
              <Bar dataKey="ml" name="Hydration (ml)" fill="#2E6DA4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
