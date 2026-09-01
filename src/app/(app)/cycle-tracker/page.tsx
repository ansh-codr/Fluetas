'use client';

import React, { useState } from 'react';
import { mockCycleData } from '@/lib/mock/dashboardData';
import {
  Calendar,
  Sparkles,
  Heart,
  Droplet,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';

const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

function getDayPhase(day: number): { name: string; color: string; bg: string } {
  if (day >= 1 && day <= 5) return { name: 'Menstrual', color: '#F472B6', bg: 'rgba(244,114,182,0.18)' };
  if (day >= 6 && day <= 13) return { name: 'Follicular', color: '#38BDF8', bg: 'rgba(56,189,248,0.18)' };
  if (day >= 14 && day <= 17) return { name: 'Ovulation', color: '#10B981', bg: 'rgba(16,185,129,0.22)' };
  return { name: 'Luteal', color: '#A78BFA', bg: 'rgba(167,139,250,0.18)' };
}

export default function CycleTrackerPage() {
  const [selectedDay, setSelectedDay] = useState(12);
  const [loggedSymptoms, setLoggedSymptoms] = useState<Record<number, string[]>>({
    12: ['High Energy', 'Mild Cramps'],
    11: ['Good Mood', 'Normal Sleep'],
    1: ['Heavy Flow', 'Cramps'],
    2: ['Moderate Flow'],
  });
  const [toast, setToast] = useState(false);

  const toggleSymptom = (symptom: string) => {
    const current = loggedSymptoms[selectedDay] || [];
    const exists = current.includes(symptom);
    const updated = exists ? current.filter(s => s !== symptom) : [...current, symptom];
    setLoggedSymptoms({ ...loggedSymptoms, [selectedDay]: updated });
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const selectedPhase = getDayPhase(selectedDay);

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#10B981] text-black font-bold text-xs py-2 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          Day {selectedDay} biomarkers updated!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            MENSTRUAL CYCLE & OVULATION CALENDAR
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Hormone phase tracking, fertility window prediction, and symptom correlation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#13161F] p-1 rounded-xl border border-[#1E2133] self-start sm:self-auto">
          <button className="p-1 text-[#8B91B0] hover:text-white"><ChevronLeft size={16} /></button>
          <span className="font-['Outfit'] text-xs font-bold px-2 text-[#E8EAF6]">August 2026</span>
          <button className="p-1 text-[#8B91B0] hover:text-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Overview Prediction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="fluetas-card p-4 bg-gradient-to-br from-[#13161F] to-[#0A1E2B] border-[#38BDF8]/30">
          <span className="text-[0.68rem] font-bold text-[#38BDF8] uppercase tracking-wider block mb-1">Current State</span>
          <p className="font-['Outfit'] text-lg font-bold text-[#E8EAF6] m-0">Day 12 · Follicular</p>
          <p className="text-xs text-[#8B91B0] m-0 mt-0.5">High stamina & cognitive focus</p>
        </div>

        <div className="fluetas-card p-4 bg-gradient-to-br from-[#13161F] to-[#0D2418] border-[#10B981]/30">
          <span className="text-[0.68rem] font-bold text-[#10B981] uppercase tracking-wider block mb-1">Fertility Window</span>
          <p className="font-['Outfit'] text-lg font-bold text-[#E8EAF6] m-0">14 – 17 Aug (6 Days)</p>
          <p className="text-xs text-[#8B91B0] m-0 mt-0.5">Peak LH surge projected 15 Aug</p>
        </div>

        <div className="fluetas-card p-4 bg-gradient-to-br from-[#13161F] to-[#260E1A] border-[#F472B6]/30">
          <span className="text-[0.68rem] font-bold text-[#F472B6] uppercase tracking-wider block mb-1">Next Period Projected</span>
          <p className="font-['Outfit'] text-lg font-bold text-[#E8EAF6] m-0">29 Aug 2026</p>
          <p className="text-xs text-[#8B91B0] m-0 mt-0.5">28-day cycle length regularity: 96%</p>
        </div>
      </div>

      {/* Main Month Matrix Calendar */}
      <div className="fluetas-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <span className="section-title">FULL MONTH VIEW (TAP ANY DAY TO LOG)</span>

          {/* Phase Legend */}
          <div className="flex items-center gap-3 text-[0.68rem] font-semibold text-[#8B91B0] flex-wrap">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F472B6]" /><span>Menstrual (1-5)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" /><span>Follicular (6-13)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /><span>Ovulation (14-17)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]" /><span>Luteal (18-28)</span></div>
          </div>
        </div>

        {/* Calendar Grid 7 Columns */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[0.68rem] font-bold text-[#8B91B0] uppercase py-1">
              {d}
            </div>
          ))}

          {/* Empty offset for Aug 2026 (starts Saturday = 6 offset slots) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[52px] sm:min-h-[64px] rounded-xl opacity-20 border border-transparent" />
          ))}

          {monthDays.map(day => {
            const phase = getDayPhase(day);
            const isSelected = selectedDay === day;
            const hasLogs = (loggedSymptoms[day] || []).length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`min-h-[52px] sm:min-h-[64px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-white shadow-[0_0_14px_rgba(255,255,255,0.4)] scale-105 z-10'
                    : 'border-[#1E2133] hover:border-[#2A3050]'
                }`}
                style={{ backgroundColor: phase.bg }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Outfit'] font-bold text-xs sm:text-sm text-[#E8EAF6]">
                    {day}
                  </span>
                  {hasLogs && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />}
                </div>

                <span
                  className="text-[0.6rem] font-bold truncate hidden sm:block"
                  style={{ color: phase.color }}
                >
                  {phase.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Logger Panel */}
      <div className="fluetas-card p-5 bg-gradient-to-r from-[#13161F] to-[#181C2A] border-[#38BDF8]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div>
            <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
              LOGGING FOR DAY {selectedDay} (AUGUST {selectedDay}, 2026)
            </h3>
            <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
              Current Phase: <strong style={{ color: selectedPhase.color }}>{selectedPhase.name}</strong>
            </p>
          </div>
          <span className="text-xs text-[#8B91B0]">Tap pills to toggle symptoms</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            'Spotting / Light Flow',
            'Moderate Flow',
            'Heavy Flow',
            'Mild Cramps',
            'Severe Cramps',
            'High Energy',
            'Low Energy / Fatigue',
            'Bloating',
            'Good Mood',
            'Anxiety / Mood Swing',
            'Headache',
            'Clear Skin',
          ].map(symptom => {
            const active = (loggedSymptoms[selectedDay] || []).includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#10B981] text-black font-bold border-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'bg-[#0B0D14] text-[#8B91B0] border-[#1E2133] hover:text-white'
                }`}
              >
                {active ? '✓ ' : '+ '}
                {symptom}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
