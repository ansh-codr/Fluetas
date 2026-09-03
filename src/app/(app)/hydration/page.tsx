'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useHydration } from '@/hooks/useHydration';
import {
  Droplets,
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Pencil,
  X,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

const QUICK_AMOUNTS = [
  { label: 'Glass', amount: 250, icon: '🥛' },
  { label: 'Bottle', amount: 500, icon: '💧' },
  { label: 'Sports', amount: 750, icon: '🍶' },
  { label: 'Large', amount: 1000, icon: '🫗' },
  { label: 'Custom', amount: 0, icon: '➕' },
];

function formatTime(timestamp: { seconds: number } | string | null | undefined): string {
  if (!timestamp) return 'Just now';
  try {
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Just now';
  }
}

function dayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return dateStr;
  }
}

export default function HydrationPage() {
  const {
    logs,
    totalMl,
    goalMl,
    hasPersonalizedGoal,
    pct,
    weeklyData,
    loading,
    error,
    addWater,
    updateWater,
    deleteWater,
    submitting,
    reload,
  } = useHydration();

  const [customAmount, setCustomAmount] = useState<number>(350);
  const [customType, setCustomType] = useState('Pure Filtered Water');
  const [showCustom, setShowCustom] = useState(false);

  // Edit State
  const [editingLog, setEditingLog] = useState<{ id: string; amount: number; type: string } | null>(null);
  const [editAmount, setEditAmount] = useState<number>(250);
  const [editType, setEditType] = useState('Pure Filtered Water');

  const handleQuickAdd = async (amount: number, type = 'Pure Filtered Water') => {
    if (amount === 0) {
      setShowCustom(true);
      return;
    }
    await addWater(amount, type);
  };

  const handleCustomAdd = async () => {
    if (!customAmount || customAmount <= 0) return;
    await addWater(customAmount, customType.trim() || 'Pure Filtered Water');
    setShowCustom(false);
  };

  const handleUpdate = async () => {
    if (!editingLog || editAmount <= 0) return;
    await updateWater(editingLog.id, editAmount, editType.trim() || 'Pure Filtered Water');
    setEditingLog(null);
  };

  const handleDelete = async (logId: string) => {
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
      {/* Header with Manual Tracking Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/20 flex items-center gap-1">
              <Droplets size={11} />
              Manual Tracking Telemetry
            </span>
          </div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            DAILY HYDRATION TRACKER
          </h1>
          <p className="text-xs sm:text-sm text-[#586151] m-0 mt-0.5">
            Log and manage your daily fluid intake.
          </p>
        </div>

        <button
          onClick={reload}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-[rgba(18,22,15,0.10)] bg-white text-xs text-[#586151] hover:text-[#12160F] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Technical Error Notice (with Retry) */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={reload}
            className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-colors cursor-pointer shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Unconfigured Profile Target Notice (Section 6 Requirement) */}
      {!hasPersonalizedGoal && (
        <div className="p-3.5 rounded-xl bg-[#2E6DA4]/5 border border-[#2E6DA4]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#2E6DA4]">
            <Sparkles size={15} className="shrink-0" />
            <span>
              <strong>Personalized Goal:</strong> Complete your health profile to calculate your exact hydration target.
            </span>
          </div>
          <Link
            href="/onboarding"
            className="px-3 py-1.5 rounded-lg bg-[#2E6DA4] hover:bg-[#255885] text-white text-[0.72rem] font-bold no-underline flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>Complete Profile</span>
            <ArrowRight size={12} />
          </Link>
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
              <span className="text-sm font-semibold text-[#586151]">
                {hasPersonalizedGoal ? `/ ${goalMl} ml` : 'ml logged'}
              </span>
            </div>
          </div>
        </div>

        {hasPersonalizedGoal && goalMl ? (
          <div className="flex-1 max-w-xs w-full space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#586151]">Daily Target</span>
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
        ) : (
          <div className="text-xs text-[#586151] max-w-xs text-right">
            <span>Manual logging is active. Each glass or bottle updates your daily total in real time.</span>
          </div>
        )}
      </div>

      {/* Today's Log Timeline (Distinguishing Loading, Empty, Data) */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="section-title">TODAY&apos;S INTAKE HISTORY ({logs.length} entries)</span>
          <span className="text-xs text-[#2E6DA4] font-semibold">{totalMl} ml total</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-11 bg-[#F2F4EE] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
            <p className="text-3xl mb-2">💧</p>
            <p className="font-bold text-[#12160F] text-sm m-0">NO WATER LOGGED YET</p>
            <p className="text-[#586151] text-xs m-0 mt-1">Start tracking your hydration manually using the quick-add buttons above.</p>
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
                        if (log.id) {
                          setEditingLog({ id: log.id, amount: log.amount, type: log.type });
                          setEditAmount(log.amount);
                          setEditType(log.type);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#586151] hover:text-[#2E6DA4] hover:bg-white cursor-pointer transition-colors"
                      title="Edit Entry"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => log.id && handleDelete(log.id)}
                      className="p-1.5 rounded-lg text-[#586151] hover:text-red-500 hover:bg-white cursor-pointer transition-colors"
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
          <span className="text-xs text-[#586151]">
            Weekly Avg: <strong className="text-[#12160F]">{weeklyAvg} ml/day</strong>
          </span>
        </div>

        {weeklyChartData.length > 0 ? (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#586151' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#586151' }} tickLine={false} axisLine={false} unit="ml" />
                <Tooltip
                  formatter={(val: any) => [`${val} ml`, 'Intake']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                  contentStyle={{ backgroundColor: '#12160F', color: '#fff', borderRadius: 8, fontSize: 11 }}
                />
                <Bar dataKey="ml" radius={[6, 6, 0, 0]}>
                  {weeklyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={hasPersonalizedGoal && goalMl && entry.ml >= goalMl ? '#2E7D32' : '#2E6DA4'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-[#586151]">
            <span>Log hydration over multiple days to populate your weekly trend.</span>
          </div>
        )}
      </div>

      {/* Edit Entry Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="fluetas-card p-5 max-w-sm w-full bg-white shadow-xl animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(18,22,15,0.08)] pb-3">
              <span className="font-['Outfit'] font-bold text-sm text-[#12160F]">Edit Hydration Entry</span>
              <button
                onClick={() => setEditingLog(null)}
                className="text-[#586151] hover:text-[#12160F] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#586151] mb-1">Amount (ml)</label>
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
                <label className="block text-xs font-semibold text-[#586151] mb-1">Fluid Type</label>
                <input
                  type="text"
                  value={editType}
                  onChange={e => setEditType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] outline-none focus:border-[#2E6DA4]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[rgba(18,22,15,0.08)]">
              <button
                onClick={() => setEditingLog(null)}
                className="px-3 py-1.5 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl bg-[#2E6DA4] hover:bg-[#255885] text-white text-xs font-bold cursor-pointer transition-colors"
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
