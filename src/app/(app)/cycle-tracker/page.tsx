'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  saveDailyCycleLog,
  deleteDailyCycleLog,
  getAllCycleLogs,
  saveCycleSettings,
  getCycleSettings,
} from '@/lib/services/cycleService';
import {
  DailyCycleLog,
  CycleSettings,
  CycleAnalysis,
  DayCalendarInfo,
} from '@/lib/cycle/types';
import {
  analyzeCycleData,
  buildMonthCalendarDays,
  isBleeding,
} from '@/lib/cycle/calculator';
import CycleSetupModal from '@/components/cycle/CycleSetupModal';
import DayLogDrawer from '@/components/cycle/DayLogDrawer';
import {
  ChevronLeft,
  ChevronRight,
  CalendarHeart,
  Droplets,
  Heart,
  Sparkles,
  Settings2,
  Plus,
  RefreshCw,
  Info,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CycleTrackerPage() {
  const { user } = useAuth();

  // Navigation Calendar Date (Year and Month index 0-11)
  const today = useMemo(() => new Date(), []);
  const [navYear, setNavYear] = useState<number>(today.getFullYear());
  const [navMonth, setNavMonth] = useState<number>(today.getMonth()); // 0 = Jan

  // Selected date on calendar
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr());

  // Firestore Data State
  const [logs, setLogs] = useState<DailyCycleLog[]>([]);
  const [settings, setSettings] = useState<CycleSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Panels
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [expandedCycleId, setExpandedCycleId] = useState<string | null>(null);

  // Load all user logs and settings
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [fetchedLogs, fetchedSettings] = await Promise.all([
        getAllCycleLogs(user.uid),
        getCycleSettings(user.uid),
      ]);
      setLogs(fetchedLogs);
      setSettings(fetchedSettings);
    } catch (err) {
      console.warn('[CycleTracker] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Clinical Analysis computed from real logs and settings
  const analysis: CycleAnalysis = useMemo(() => {
    return analyzeCycleData(logs, settings || undefined);
  }, [logs, settings]);

  // Month Calendar Matrix
  const calendarDays: DayCalendarInfo[] = useMemo(() => {
    return buildMonthCalendarDays(navYear, navMonth, logs, analysis, selectedDateStr);
  }, [navYear, navMonth, logs, analysis, selectedDateStr]);

  // Active Log for Selected Date
  const selectedDayLog = useMemo(() => {
    return logs.find(l => l.date === selectedDateStr) || null;
  }, [logs, selectedDateStr]);

  // Month navigation
  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavYear(prev => prev - 1);
      setNavMonth(11);
    } else {
      setNavMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavYear(prev => prev + 1);
      setNavMonth(0);
    } else {
      setNavMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setNavYear(now.getFullYear());
    setNavMonth(now.getMonth());
    setSelectedDateStr(getTodayStr());
  };

  // Quick action: Period started today
  const handleQuickPeriodToday = async () => {
    if (!user) return;
    const todayStr = getTodayStr();
    await saveDailyCycleLog(user.uid, {
      date: todayStr,
      flow: 'moderate',
    });
    await loadData();
    setSelectedDateStr(todayStr);
  };

  // Save Settings from modal
  const handleSaveSettings = async (newSettings: Partial<CycleSettings>) => {
    if (!user) return;
    await saveCycleSettings(user.uid, newSettings);
    await loadData();
  };

  // Save Day Log from drawer
  const handleSaveDayLog = async (logData: any) => {
    if (!user) return;
    await saveDailyCycleLog(user.uid, logData);
    await loadData();
  };

  // Delete Day Log
  const handleDeleteDayLog = async (dateStr: string) => {
    if (!user) return;
    await deleteDailyCycleLog(user.uid, dateStr);
    await loadData();
  };

  const monthLabel = new Date(navYear, navMonth, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#C23B6B]/10 text-[#C23B6B] border border-[#C23B6B]/20 flex items-center gap-1">
              <CalendarHeart size={11} />
              FLUETAS HER · Menstrual Telemetry
            </span>
          </div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            CYCLE &amp; OVULATION TRACKER
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Observation-backed cycle phases, fertile window estimates, and biomarker tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            href="/experts"
            className="px-3 py-2 rounded-xl border border-[#0F766E]/30 bg-[#0F766E]/10 text-xs font-bold text-[#0F766E] hover:bg-[#0F766E]/20 flex items-center gap-1.5 cursor-pointer shadow-2xs no-underline"
          >
            <ShieldCheck size={14} />
            <span>Consult Dr. Swati Dixit</span>
          </Link>

          <button
            onClick={() => setSetupModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.12)] bg-white text-xs font-bold text-[#586151] hover:text-[#12160F] flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Settings2 size={14} />
            <span>Cycle Setup</span>
          </button>

          <button
            onClick={handleQuickPeriodToday}
            className="btn-primary bg-[#C23B6B] hover:bg-[#A32A55] text-white px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Droplets size={14} />
            <span>Period Started Today</span>
          </button>
        </div>
      </div>

      {/* ── Unconfigured Setup Banner (Clean Empty State) ── */}
      {!analysis.configured && (
        <div className="p-5 rounded-2xl bg-white border border-[#C23B6B]/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C23B6B]/10 text-[#C23B6B] flex items-center justify-center shrink-0">
              <CalendarHeart size={24} />
            </div>
            <div>
              <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-[#12160F] m-0">
                Set up Cycle Tracking
              </h3>
              <p className="text-xs text-[#586151] m-0 mt-0.5 max-w-md leading-relaxed">
                Log your last period date and typical cycle length to calibrate personalized phase predictions and fertile window tracking.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSetupModalOpen(true)}
            className="btn-primary bg-[#C23B6B] hover:bg-[#A32A55] text-white text-xs px-5 py-2.5 rounded-xl font-bold shrink-0 cursor-pointer shadow-xs"
          >
            Set Up Cycle Tracking
          </button>
        </div>
      )}

      {/* ── Overview Summary Cards (Real Calculated Data) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Card 1: Current Cycle Day & Phase */}
        <div className="fluetas-card p-4 bg-white border-[rgba(18,22,15,0.08)] flex flex-col justify-between">
          <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider block mb-1">
            Current State
          </span>
          <div>
            <p className="font-['Outfit'] text-base sm:text-lg font-bold text-[#12160F] m-0">
              {analysis.currentCycleDay ? `Cycle Day ${analysis.currentCycleDay}` : 'Not Started'}
            </p>
            <p className="text-xs font-semibold text-[#C23B6B] m-0 mt-0.5">
              {analysis.isPeriodToday
                ? 'Period Active'
                : analysis.currentPhase !== 'Unknown'
                ? `${analysis.currentPhase} Phase`
                : 'Awaiting logs'}
            </p>
          </div>
        </div>

        {/* Card 2: Next Period Prediction */}
        <div className="fluetas-card p-4 bg-white border-[rgba(18,22,15,0.08)] flex flex-col justify-between">
          <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider block mb-1">
            Next Period
          </span>
          <div>
            <p className="font-['Outfit'] text-base sm:text-lg font-bold text-[#12160F] m-0">
              {analysis.factorsSuppressingPredictions
                ? 'Predictions Paused'
                : analysis.predictedNextPeriodStart
                ? new Date(analysis.predictedNextPeriodStart + 'T12:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Need more data'}
            </p>
            <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">
              {analysis.factorsSuppressingPredictions
                ? 'Hormonal factor active'
                : analysis.confidence !== 'none'
                ? `Predicted (${analysis.confidence} confidence)`
                : 'Set typical length'}
            </p>
          </div>
        </div>

        {/* Card 3: Estimated Fertile Window */}
        <div className="fluetas-card p-4 bg-[#F0F9FF] border-[#2E6DA4]/20 flex flex-col justify-between">
          <span className="text-[0.65rem] font-bold text-[#2E6DA4] uppercase tracking-wider block mb-1">
            Estimated Fertile Window
          </span>
          <div>
            <p className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0">
              {analysis.factorsSuppressingPredictions
                ? 'Paused'
                : analysis.estimatedFertileWindowStart && analysis.estimatedFertileWindowEnd
                ? `${new Date(analysis.estimatedFertileWindowStart + 'T12:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} – ${new Date(analysis.estimatedFertileWindowEnd + 'T12:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`
                : 'Need more data'}
            </p>
            <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">
              {analysis.estimatedOvulationDate
                ? `Ovulation ~ ${new Date(analysis.estimatedOvulationDate + 'T12:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`
                : 'Based on calendar estimation'}
            </p>
          </div>
        </div>

        {/* Card 4: Cycle Length & Logged Entries */}
        <div className="fluetas-card p-4 bg-white border-[rgba(18,22,15,0.08)] flex flex-col justify-between">
          <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider block mb-1">
            Cycle Metrics
          </span>
          <div>
            <p className="font-['Outfit'] text-base sm:text-lg font-bold text-[#12160F] m-0">
              {analysis.averageCycleLength ? `${analysis.averageCycleLength} Days` : 'Not set'}
            </p>
            <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">
              {logs.length} logged entries · {analysis.completedCycles.length} completed cycles
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Month Calendar Matrix ── */}
      <div className="fluetas-card p-4 sm:p-6 space-y-4">
        {/* Calendar Nav Controls & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(18,22,15,0.06)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.10)] p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-[#586151] hover:text-[#12160F] hover:bg-white cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-['Outfit'] text-sm font-bold px-3 text-[#12160F]">
                {monthLabel}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-[#586151] hover:text-[#12160F] hover:bg-white cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={handleGoToday}
              className="px-2.5 py-1.5 rounded-xl border border-[rgba(18,22,15,0.10)] bg-white text-[0.7rem] font-bold text-[#586151] hover:text-[#12160F] cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Visual Legend */}
          <div className="flex items-center gap-3 text-[0.68rem] font-semibold text-[#586151] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C23B6B]" />
              <span>Logged Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#C23B6B] bg-[#FDF2F8]" />
              <span>Predicted Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BAE6FD]" />
              <span>Fertile Window</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7A4E9E]" />
              <span>Est. Ovulation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
              <span>Symptoms</span>
            </div>
          </div>
        </div>

        {/* Calendar Day Grid */}
        <div>
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-1.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div
                key={d}
                className="text-center text-[0.68rem] font-bold text-[#8A9482] uppercase py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((dayInfo, idx) => {
              // Styling derivation
              let cellBg = 'bg-white';
              let cellBorder = 'border-[rgba(18,22,15,0.08)]';
              let badgeColor = 'text-[#12160F]';

              if (dayInfo.hasBleeding) {
                cellBg = 'bg-[#FDF2F8]';
                cellBorder = 'border-[#C23B6B]';
                badgeColor = 'text-[#C23B6B]';
              } else if (dayInfo.isPredictedPeriod) {
                cellBg = 'bg-[#FFF1F2]/60';
                cellBorder = 'border-dashed border-[#C23B6B]/60';
              } else if (dayInfo.isEstimatedOvulation) {
                cellBg = 'bg-[#FAF5FF]';
                cellBorder = 'border-[#7A4E9E]/40';
              } else if (dayInfo.isEstimatedFertile) {
                cellBg = 'bg-[#F0F9FF]';
                cellBorder = 'border-[#2E6DA4]/30';
              }

              if (dayInfo.isSelected) {
                cellBorder = 'border-[#12160F] ring-2 ring-[#12160F]/15';
              }

              const opacityClass = dayInfo.isCurrentMonth ? 'opacity-100' : 'opacity-40';

              return (
                <button
                  key={`${dayInfo.date}_${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedDateStr(dayInfo.date);
                    setDayDrawerOpen(true);
                  }}
                  className={`min-h-[58px] sm:min-h-[74px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border flex flex-col justify-between text-left transition-all cursor-pointer relative hover:shadow-xs ${cellBg} ${cellBorder} ${opacityClass}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-['Outfit'] font-bold text-xs sm:text-sm ${
                        dayInfo.isToday
                          ? 'w-6 h-6 rounded-full bg-[#12160F] text-white flex items-center justify-center -ml-0.5'
                          : badgeColor
                      }`}
                    >
                      {dayInfo.dayNumber}
                    </span>

                    {/* Flow Badge or Indicator Dot */}
                    <div className="flex items-center gap-1">
                      {dayInfo.hasBleeding && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C23B6B] shadow-2xs" />
                      )}
                      {dayInfo.isEstimatedOvulation && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7A4E9E] ring-1 ring-white" />
                      )}
                      {dayInfo.hasSymptoms && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                      )}
                    </div>
                  </div>

                  {/* Day Subtext / Phase Label */}
                  <div className="text-[0.62rem] truncate hidden sm:block">
                    {dayInfo.hasBleeding ? (
                      <span className="font-bold text-[#C23B6B] capitalize">
                        {dayInfo.bleedingFlow}
                      </span>
                    ) : dayInfo.isPredictedPeriod ? (
                      <span className="text-[#C23B6B]/80 italic">Predicted</span>
                    ) : dayInfo.isEstimatedOvulation ? (
                      <span className="text-[#7A4E9E] font-bold">Ovulation</span>
                    ) : dayInfo.isEstimatedFertile ? (
                      <span className="text-[#2E6DA4] font-semibold">Fertile</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Selected Date Quick Actions & History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Selected Day Summary Card */}
        <div className="fluetas-card p-5 bg-[#FAFAF6] border-[rgba(18,22,15,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider">
                Selected Day Overview
              </span>
              <button
                onClick={() => setDayDrawerOpen(true)}
                className="text-xs font-bold text-[#C23B6B] hover:underline cursor-pointer"
              >
                Edit Details →
              </button>
            </div>

            <h3 className="font-['Outfit'] font-black text-base sm:text-lg text-[#12160F] m-0">
              {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>

            {selectedDayLog ? (
              <div className="mt-3 space-y-2 text-xs">
                {isBleeding(selectedDayLog.flow) ? (
                  <div className="p-2 rounded-xl bg-[#FDF2F8] border border-[#C23B6B]/20 flex items-center gap-2 text-[#C23B6B]">
                    <Droplets size={14} />
                    <span className="font-bold capitalize">{selectedDayLog.flow} Flow Recorded</span>
                  </div>
                ) : (
                  <p className="text-[0.68rem] text-[#586151] m-0">No bleeding logged</p>
                )}

                {selectedDayLog.symptoms && selectedDayLog.symptoms.length > 0 && (
                  <div>
                    <span className="text-[0.65rem] text-[#8A9482] block mb-1">Symptoms:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDayLog.symptoms.map(s => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-white border border-[rgba(18,22,15,0.08)] text-[0.68rem] text-[#12160F]"
                        >
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDayLog.mood && (
                  <p className="text-[0.68rem] text-[#586151] m-0">
                    Mood: <strong className="text-[#12160F] capitalize">{selectedDayLog.mood}</strong>
                  </p>
                )}

                {selectedDayLog.notes && (
                  <p className="text-[0.68rem] text-[#586151] m-0 italic bg-white p-2 rounded-lg border border-[rgba(18,22,15,0.06)]">
                    &quot;{selectedDayLog.notes}&quot;
                  </p>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#8A9482]">
                <p className="m-0">No symptoms or flow logged for this day.</p>
                <button
                  onClick={() => setDayDrawerOpen(true)}
                  className="mt-2 text-xs font-bold text-[#C23B6B] hover:underline cursor-pointer"
                >
                  + Log for this date
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setDayDrawerOpen(true)}
            className="mt-4 w-full py-2 rounded-xl bg-white border border-[rgba(18,22,15,0.12)] text-xs font-bold text-[#12160F] hover:bg-[#F2F4EE] cursor-pointer text-center"
          >
            Open Full Day Log
          </button>
        </div>

        {/* Right 2 cols: Cycle History & Evidence-based Insights */}
        <div className="lg:col-span-2 space-y-4">
          {/* Health Insights Box */}
          <div className="fluetas-card p-4 sm:p-5 bg-[#FDF2F8]/60 border-[#C23B6B]/20 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#C23B6B]" />
              <span className="font-['Outfit'] font-bold text-xs sm:text-sm text-[#12160F]">
                CLINICAL CYCLE INSIGHTS
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#586151]">
              {analysis.insights.map((ins, i) => (
                <p key={i} className="m-0 leading-relaxed">
                  • {ins}
                </p>
              ))}
            </div>
          </div>

          {/* Historical Cycles Section */}
          <div className="fluetas-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="section-title">CYCLE HISTORY ({analysis.completedCycles.length})</span>
              <span className="text-xs text-[#586151]">
                {analysis.averageCycleLength ? `Avg: ${analysis.averageCycleLength} days` : 'Log cycles to build history'}
              </span>
            </div>

            {analysis.completedCycles.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#8A9482]">
                <p className="m-0">No completed cycles recorded yet.</p>
                <p className="text-[0.68rem] text-[#8A9482] mt-0.5">
                  When you log multiple consecutive periods, full cycles will be computed and archived here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {analysis.completedCycles.map(c => {
                  const isExpanded = expandedCycleId === c.id;
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.06)] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#12160F]">
                            Cycle #{c.cycleNumber}
                          </span>
                          <span className="text-xs text-[#586151] ml-2">
                            {c.startDate} to {c.endDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xs text-[#C23B6B]">
                            {c.lengthDays} days
                          </span>
                          <span className="text-xs text-[#586151]">
                            Period: {c.periodDurationDays} days
                          </span>
                          <button
                            onClick={() => setExpandedCycleId(isExpanded ? null : c.id)}
                            className="p-1 text-[#8A9482] hover:text-[#12160F]"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pt-2 border-t border-[rgba(18,22,15,0.06)] text-xs text-[#586151]">
                          <p className="m-0">Bleeding logged on: {c.bleedDates.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Day Log Drawer Modal ── */}
      <DayLogDrawer
        isOpen={dayDrawerOpen}
        onClose={() => setDayDrawerOpen(false)}
        dateStr={selectedDateStr}
        cycleDayNumber={analysis.currentCycleDay}
        phaseName={analysis.currentPhase}
        existingLog={selectedDayLog}
        onSaveLog={handleSaveDayLog}
        onDeleteLog={handleDeleteDayLog}
      />

      {/* ── Cycle Setup / Calibration Modal ── */}
      <CycleSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        initialSettings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
