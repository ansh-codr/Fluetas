'use client';

import React, { useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { HydrationEntry } from '@/lib/services/hydrationService';
import {
  Droplets,
  Plus,
  TrendingUp,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Pencil,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const QUICK_AMOUNTS = [
  { amount: 250, label: 'Glass', icon: '🥛', desc: 'Standard glass (250 ml)' },
  { amount: 500, label: 'Bottle', icon: '🍶', desc: 'Small bottle (500 ml)' },
  { amount: 750, label: 'Sports', icon: '🏃', desc: 'Sports bottle (750 ml)' },
  { amount: 1000, label: 'Large', icon: '🫙', desc: 'Large flask (1000 ml)' },
  { amount: 0, label: 'Custom', icon: '✏️', desc: 'Enter exact amount' },
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
  const { logs, totalMl, goalMl, pct, weeklyData, loading, error, addWater, updateWater, deleteWater, submitting } = useHydration();

  const [customAmount, setCustomAmount] = useState(300);
  const [customType, setCustomType] = useState('Pure Filtered Water');
  const [showCustom, setShowCustom] = useState(false);

  // Edit State
  const [editingLog, setEditingLog] = useState<HydrationEntry | null>(null);
  const [editAmount, setEditAmount] = useState(250);
  const [editType, setEditType] = useState('Pure Filtered Water');

  const handleQuickAdd = async (amount: number, type: string) => {
    if (amount === 0) { setShowCustom(true); return; }
    await addWater(amount, type);
  };

  const handleCustomAdd = async () => {
    if (customAmount < 1 || customAmount > 5000) return;
    await addWater(customAmount, customType);
    setShowCustom(false);
  };

  const handleSaveEdit = async () => {
    if (!editingLog?.id || editAmount < 1 || editAmount > 5000) return;
    await updateWater(editingLog.id, editAmount, editType);
    setEditingLog(null);
  };

  const handleDelete = async (logId?: string) => {
    if (!logId) return;
    if (confirm('Delete this hydration entry?')) {
      await deleteWater(logId);
    }
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
        <p className="text-xs sm:text-sm text-[#586151] m-0 mt-0.5">
          Real-time fluid telemetry, sovereign logging, and hydration volume.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* Quick Add Bar */}
      <div className="fluetas-card p-4 sm:p-5">
        <span className="section-title mb-3 block">LOG FLUID INTAKE</span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {QUICK_AMOUNTS.map(item => (
            <button
              key={item.label}
              onClick={() => handleQuickAdd(item.amount, item.label === 'Custom' ? '' : 'Pure Filtered Water')}
              disabled={submitting}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-[rgba(18,22,15,0.10)] bg-white hover:border-[#2E6DA4] hover:bg-[#2E6DA4]/5 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-bold text-[#12160F]">{item.label}</span>
              <span className="text-[0.65rem] text-[#586151]">{item.amount > 0 ? `+${item.amount} ml` : 'Custom'}</span>
            </button>
          ))}
        </div>

        {/* Custom Input Drawer */}
        {showCustom && (
          <div className="mt-4 pt-4 border-t border-[rgba(18,22,15,0.08)] flex flex-col sm:flex-row gap-3 items-end animate-slide-up">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-[#586151] mb-1">Amount (ml)</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={customAmount}
                onChange={e => setCustomAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] outline-none focus:border-[#2E6DA4]"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-[#586151] mb-1">Fluid Type</label>
              <input
                type="text"
                value={customType}
                onChange={e => setCustomType(e.target.value)}
                placeholder="e.g. Electrolytes, Herbal Tea"
                className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] outline-none focus:border-[#2E6DA4]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustom(false)}
                className="px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomAdd}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#2E6DA4] hover:bg-[#255885] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Log Intake
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today's Intake Status Card */}
      <div className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-br from-white to-[#F0F6FA]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2E6DA4]/10 text-[#2E6DA4] flex items-center justify-center font-black text-xl">
            <Droplets size={28} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#2E6DA4] uppercase tracking-wider">Today&apos;s Total Intake</span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Outfit'] text-3xl font-black text-[#12160F]">
                {totalMl}
              </span>
              <span className="text-sm font-semibold text-[#586151]">/ {goalMl} ml</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xs w-full space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#586151]">Daily Progress</span>
            <span className="text-[#2E6DA4] font-bold">{pct}%</span>
          </div>
          <div className="h-3 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2E6DA4] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[0.68rem] text-[#586151]">
            <span>Remaining: <strong className="text-[#2E6DA4]">{Math.max(0, goalMl - totalMl)} ml</strong></span>
            <span>Target: {(goalMl / 1000).toFixed(1)}L</span>
          </div>
        </div>
      </div>

      {/* Today's Log Timeline */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="section-title">TODAY&apos;S INTAKE HISTORY ({logs.length} entries)</span>
          <span className="text-xs text-[#2E6DA4] font-semibold">{totalMl} ml verified</span>
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
            <p className="text-[#586151] text-xs m-0 mt-1">Use the quick-add buttons above to log your hydration telemetry.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] hover:border-[#2E6DA4]/30 transition-colors"
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

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#2E6DA4]">+{log.amount} ml</span>
                  <div className="flex items-center gap-1 border-l border-[rgba(18,22,15,0.10)] pl-2">
                    <button
                      onClick={() => {
                        setEditingLog(log);
                        setEditAmount(log.amount);
                        setEditType(log.type);
                      }}
                      className="p-1 rounded text-[#586151] hover:text-[#2E6DA4] cursor-pointer transition-colors"
                      title="Edit Entry"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1 rounded text-[#586151] hover:text-red-500 cursor-pointer transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
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

      {/* Inline Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[rgba(18,22,15,0.10)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">Edit Hydration Entry</h3>
              <button
                onClick={() => setEditingLog(null)}
                className="p-1 rounded-lg text-[#586151] hover:text-[#12160F] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-[#586151] font-semibold mb-1">Volume (ml)</label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={editAmount}
                  onChange={e => setEditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] outline-none focus:border-[#2E6DA4]"
                />
              </div>

              <div>
                <label className="block text-[#586151] font-semibold mb-1">Fluid Type</label>
                <input
                  type="text"
                  value={editType}
                  onChange={e => setEditType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] outline-none focus:border-[#2E6DA4]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingLog(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#586151] hover:text-[#12160F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={submitting || editAmount < 1}
                className="px-4 py-2 rounded-xl bg-[#2E6DA4] hover:bg-[#255885] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
