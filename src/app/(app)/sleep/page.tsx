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
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            SLEEP ARCHITECTURE &amp; RECOVERY
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
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
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs">{error}</div>
      )}

      {/* Main Sleep Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Ring */}
        <div className="fluetas-card p-6 flex flex-col items-center justify-center text-center bg-white border border-[rgba(18,22,15,0.10)]">
          {loading ? (
            <div className="w-36 h-36 rounded-full bg-[#F2F4EE] animate-pulse" />
          ) : !todaySleep ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-4xl">🌙</p>
              <p className="font-['Outfit'] font-bold text-[#12160F] text-sm m-0">No sleep logged</p>
              <p className="text-[#586151] text-xs m-0">Tap &quot;Log Sleep&quot; to record last night&apos;s rest</p>
              <button onClick={() => setLogOpen(true)} className="mt-1 px-4 py-2 rounded-xl bg-[#7A4E9E]/10 border border-[#7A4E9E]/20 text-[#7A4E9E] text-xs font-bold cursor-pointer hover:bg-[#7A4E9E]/20 transition-all">
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
                color="#7A4E9E"
                trackColor="rgba(122,78,158,0.12)"
                label={`${sleepPct}%`}
                labelColor="#12160F"
              />
              <div className="mt-3">
                <p className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
                  {todaySleep.durationHrs}h of {targetHrs}h
                </p>
                <p className="text-xs text-[#586151] m-0 mt-0.5">
                  {todaySleep.sleepTime} → {todaySleep.wakeTime}
                  {todaySleep.quality && <> · Quality: {todaySleep.quality}/10</>}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Biometric Matrix */}
        <div className="fluetas-card p-5 md:col-span-2 flex flex-col justify-between gap-4">
          <span className="section-title">LAST NIGHT&apos;S VITALS</span>
          {!todaySleep ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#8A9482] text-sm text-center">Log sleep to see vitals breakdown</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Duration', value: `${todaySleep.durationHrs}h`, sub: `Goal: ${targetHrs}h`, color: '#7A4E9E' },
                { label: 'Quality', value: todaySleep.quality ? `${todaySleep.quality}/10` : 'Not rated', sub: todaySleep.quality && todaySleep.quality >= 7 ? 'Good' : 'Fair', color: '#2E6DA4' },
                { label: 'Bedtime', value: todaySleep.sleepTime, sub: 'Sleep onset', color: '#2E7D32' },
                { label: 'Wake Time', value: todaySleep.wakeTime, sub: 'Rise time', color: '#D97706' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl">
                  <span className="text-[0.65rem] text-[#586151] block mb-1">{item.label}</span>
                  <p className="font-['Outfit'] font-bold text-base m-0" style={{ color: item.color }}>{item.value}</p>
                  <span className="text-[0.65rem] text-[#586151]">{item.sub}</span>
                </div>
              ))}
            </div>
          )}

          {/* Connect wearable CTA */}
          <div className="p-3 bg-[#7A4E9E]/10 border border-[#7A4E9E]/20 rounded-xl text-xs text-[#7A4E9E] flex items-center justify-between gap-2">
            <span>📡 Connect a wearable for automatic HRV, RHR &amp; sleep stage tracking.</span>
            <span className="text-[0.65rem] opacity-60 shrink-0">Coming soon</span>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#7A4E9E]" />
            <span className="section-title">7-DAY SLEEP DURATION TREND</span>
          </div>
          {weeklyAvg > 0 && (
            <span className="text-xs text-[#7A4E9E] font-bold">Average: {weeklyAvg}h / night</span>
          )}
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,22,15,0.08)" vertical={false} />
              <XAxis dataKey="day" stroke="#8A9482" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A9482" fontSize={11} tickLine={false} axisLine={false} unit="h" domain={[0, 10]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(18,22,15,0.15)', borderRadius: '12px', color: '#12160F', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(val: any) => [`${val || 0}h`, 'Duration']}
              />
              <Bar dataKey="duration" name="Sleep (hrs)" fill="#7A4E9E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Sleep Modal */}
      {logOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[rgba(18,22,15,0.15)] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-slide-up">
            <button onClick={() => setLogOpen(false)} className="absolute top-4 right-4 text-[#586151] hover:text-[#12160F]">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-[#12160F] mb-4 font-['Outfit'] flex items-center gap-2">
              <Moon size={18} className="text-[#7A4E9E]" />
              Log Last Night&apos;s Sleep
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#586151] font-semibold mb-1.5">I slept at</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={e => setSleepTime(e.target.value)}
                    className="w-full bg-[#F2F4EE] border border-[rgba(18,22,15,0.15)] rounded-xl p-2.5 text-[#12160F] focus:border-[#7A4E9E] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1.5">I woke up at</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="w-full bg-[#F2F4EE] border border-[rgba(18,22,15,0.15)] rounded-xl p-2.5 text-[#12160F] focus:border-[#7A4E9E] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#586151] font-semibold mb-2">
                  Sleep Quality: <span className="text-[#7A4E9E] font-bold">{quality}/10</span>
                </label>
                <input
                  type="range" min={1} max={10} value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                  className="w-full accent-[#7A4E9E]"
                />
                <div className="flex justify-between text-[#8A9482] text-[0.6rem] mt-0.5">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-[0.7rem]">{error}</p>}

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
