'use client';

import React, { useState } from 'react';
import CircleProgress from '@/components/ui/CircleProgress';
import { useSleep } from '@/hooks/useSleep';
import {
  Moon,
  TrendingUp,
  Plus,
  X,
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

function dayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' });
}

export default function SleepPage() {
  const { todaySleep, weeklySleep, loading, error, submitting, logSleepEntry, targetHrs } = useSleep();
  const [logOpen, setLogOpen] = useState(false);
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(7);

  const handleLog = async () => {
    await logSleepEntry(sleepTime, wakeTime, quality);
    setLogOpen(false);
  };

  const sleepPct = todaySleep
    ? Math.min(100, Math.round((todaySleep.durationHrs / targetHrs) * 100))
    : 0;

  const weeklyAvg = weeklySleep.length
    ? Math.round(weeklySleep.reduce((a, d) => a + d.durationHrs, 0) /
        Math.max(1, weeklySleep.filter(d => d.durationHrs > 0).length) * 10) / 10
    : 0;

  const weeklyChartData = weeklySleep.map(d => ({
    day: dayLabel(d.date),
    duration: d.durationHrs,
    quality: d.quality,
  }));

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            SLEEP ARCHITECTURE &amp; RECOVERY
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Biometric sleep tracking, HRV recovery, and stage analysis.
          </p>
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          Log Sleep
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">{error}</div>
      )}

      {/* Main Sleep Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Ring */}
        <div className="fluetas-card p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#13161F] to-[#1E1136] border-[#A78BFA]/30">
          {loading ? (
            <div className="w-36 h-36 rounded-full bg-[#1E2133] animate-pulse" />
          ) : !todaySleep ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-4xl">🌙</p>
              <p className="font-['Outfit'] font-bold text-[#E8EAF6] text-sm m-0">No sleep logged</p>
              <p className="text-[#8B91B0] text-xs m-0">Tap "Log Sleep" to record last night's rest</p>
              <button onClick={() => setLogOpen(true)} className="mt-1 px-4 py-2 rounded-xl bg-[#A78BFA]/20 border border-[#A78BFA]/40 text-[#A78BFA] text-xs font-bold cursor-pointer hover:opacity-90 transition-all">
                Log Now
              </button>
            </div>
          ) : (
            <>
              <CircleProgress
                score={sleepPct}
                max={100}
                size={140}
                strokeWidth={10}
                color="#A78BFA"
                trackColor="#3B0764"
                label={`${sleepPct}`}
              />
              <div className="mt-3">
                <p className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                  {todaySleep.durationHrs}h of {targetHrs}h
                </p>
                <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                  {todaySleep.sleepTime} → {todaySleep.wakeTime}
                  {todaySleep.quality && <> · Quality: {todaySleep.quality}/10</>}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Biometric Matrix (placeholder — connect to wearable in future) */}
        <div className="fluetas-card p-5 md:col-span-2 flex flex-col justify-between gap-4">
          <span className="section-title">LAST NIGHT'S VITALS</span>
          {!todaySleep ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#3A3F58] text-sm text-center">Log sleep to see vitals breakdown</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Duration', value: `${todaySleep.durationHrs}h`, sub: `Goal: ${targetHrs}h`, color: '#A78BFA' },
                { label: 'Quality', value: todaySleep.quality ? `${todaySleep.quality}/10` : 'Not rated', sub: todaySleep.quality && todaySleep.quality >= 7 ? 'Good' : 'Fair', color: '#38BDF8' },
                { label: 'Bedtime', value: todaySleep.sleepTime, sub: 'Sleep onset', color: '#10B981' },
                { label: 'Wake Time', value: todaySleep.wakeTime, sub: 'Rise time', color: '#FBBF24' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[#0B0D14] border border-[#1E2133] rounded-xl">
                  <span className="text-[0.65rem] text-[#8B91B0] block mb-1">{item.label}</span>
                  <p className="font-['Outfit'] font-bold text-base m-0" style={{ color: item.color }}>{item.value}</p>
                  <span className="text-[0.65rem] text-[#8B91B0]">{item.sub}</span>
                </div>
              ))}
            </div>
          )}

          {/* Connect wearable CTA */}
          <div className="p-3 bg-[#A78BFA]/10 border border-[#A78BFA]/30 rounded-xl text-xs text-[#A78BFA] flex items-center justify-between gap-2">
            <span>📡 Connect a wearable for automatic HRV, RHR &amp; sleep stage tracking.</span>
            <span className="text-[0.65rem] opacity-60 shrink-0">Coming soon</span>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#A78BFA]" />
            <span className="section-title">7-DAY SLEEP DURATION TREND</span>
          </div>
          {weeklyAvg > 0 && (
            <span className="text-xs text-[#A78BFA] font-bold">Average: {weeklyAvg}h / night</span>
          )}
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" vertical={false} />
              <XAxis dataKey="day" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} unit="h" domain={[0, 10]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#13161F', borderColor: '#1E2133', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val || 0}h`, 'Duration']}
              />
              <Bar dataKey="duration" name="Sleep (hrs)" fill="#A78BFA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Sleep Modal */}
      {logOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-slide-up">
            <button onClick={() => setLogOpen(false)} className="absolute top-4 right-4 text-[#8B91B0] hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-[#E8EAF6] mb-4 font-['Outfit'] flex items-center gap-2">
              <Moon size={18} className="text-[#A78BFA]" />
              Log Last Night's Sleep
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1.5">I slept at</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={e => setSleepTime(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#A78BFA] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1.5">I woke up at</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-2.5 text-[#E8EAF6] focus:border-[#A78BFA] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B91B0] font-semibold mb-2">
                  Sleep Quality: <span className="text-[#A78BFA] font-bold">{quality}/10</span>
                </label>
                <input
                  type="range" min={1} max={10} value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                  className="w-full accent-[#A78BFA]"
                />
                <div className="flex justify-between text-[#3A3F58] text-[0.6rem] mt-0.5">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {error && <p className="text-red-400 text-[0.7rem]">{error}</p>}

              <button
                onClick={handleLog}
                disabled={submitting}
                className="btn-primary w-full py-2.5 justify-center font-bold mt-2 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Moon size={14} />}
                {submitting ? 'Saving...' : 'Save Sleep Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
