'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  logCycleEntry,
  getRecentCycleEntries,
  CycleEntry,
  FlowLevel,
} from '@/lib/services/cycleService';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

function getDayPhase(day: number): { name: string; color: string; bg: string } {
  if (day >= 1 && day <= 5) return { name: 'Menstrual', color: '#C23B6B', bg: '#FDF2F8' };
  if (day >= 6 && day <= 13) return { name: 'Follicular', color: '#2E6DA4', bg: '#F0F9FF' };
  if (day >= 14 && day <= 17) return { name: 'Ovulation', color: '#2E7D32', bg: '#F0FDF4' };
  return { name: 'Luteal', color: '#7A4E9E', bg: '#FAF5FF' };
}

export default function CycleTrackerPage() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  // Load entries from Firestore
  const loadEntries = async () => {
    if (!user) {
      return;
    }
    try {
      const res = await getRecentCycleEntries(user.uid, 60);
      setEntries(res);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  // Find entry for selected day in current month
  const currentMonthYear = new Date().toISOString().slice(0, 7);
  const selectedDateStr = `${currentMonthYear}-${selectedDay.toString().padStart(2, '0')}`;
  const currentEntry = entries.find(e => e.date === selectedDateStr);

  const selectedSymptoms = currentEntry?.symptoms || [];

  const toggleSymptom = async (symptom: string) => {
    if (!user) return;
    setSaving(true);
    const exists = selectedSymptoms.includes(symptom);
    const updated = exists
      ? selectedSymptoms.filter(s => s !== symptom)
      : [...selectedSymptoms, symptom];

    let flow: FlowLevel | undefined = currentEntry?.flow;
    if (symptom.includes('Flow')) {
      if (symptom.includes('Light')) flow = 'Light';
      else if (symptom.includes('Moderate') || symptom.includes('Medium')) flow = 'Medium';
      else if (symptom.includes('Heavy')) flow = 'Heavy';
      else if (symptom.includes('Spotting')) flow = 'Spotting';
    }

    try {
      await logCycleEntry(user.uid, {
        date: selectedDateStr,
        flow,
        mood: currentEntry?.mood,
        energy: currentEntry?.energy,
        symptoms: updated,
        isPeriodStart: symptom.includes('Flow') && !exists,
      });
      await loadEntries();
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const selectedPhase = getDayPhase(selectedDay);

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#2E7D32] text-white font-bold text-xs py-2 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          Day {selectedDay} cycle log saved!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            MENSTRUAL CYCLE &amp; OVULATION CALENDAR
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Hormone phase tracking, fertility window prediction, and symptom correlation.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F2F4EE] p-1 rounded-xl border border-[rgba(18,22,15,0.10)] self-start sm:self-auto">
          <button className="p-1 text-[#586151] hover:text-[#12160F]"><ChevronLeft size={16} /></button>
          <span className="font-['Outfit'] text-xs font-bold px-2 text-[#12160F]">
            {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="p-1 text-[#586151] hover:text-[#12160F]"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Overview Prediction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="fluetas-card p-4 bg-[#F0F9FF] border-[#2E6DA4]/30">
          <span className="text-[0.68rem] font-bold text-[#2E6DA4] uppercase tracking-wider block mb-1">Current State</span>
          <p className="font-['Outfit'] text-lg font-bold text-[#12160F] m-0">Day {selectedDay} · {selectedPhase.name}</p>
          <p className="text-xs text-[#586151] m-0 mt-0.5">Energy &amp; training synchronization</p>
        </div>

        <div className="fluetas-card p-4 bg-[#F0FDF4] border-[#2E7D32]/30">
          <span className="text-[0.68rem] font-bold text-[#2E7D32] uppercase tracking-wider block mb-1">Fertility Window</span>
          <p className="font-['Outfit'] text-lg font-bold text-[#12160F] m-0">Days 14 – 17</p>
          <p className="text-xs text-[#586151] m-0 mt-0.5">Ovulation phase projected</p>
        </div>

        <div className="fluetas-card p-4 bg-[#FDF2F8] border-[#C23B6B]/30">
          <span className="text-[0.68rem] font-bold text-[#C23B6B] uppercase tracking-wider block mb-1">Logged Entries</span>
          <p className="font-['Outfit'] text-lg font-bold text-[#12160F] m-0">{entries.length} Entries</p>
          <p className="text-xs text-[#586151] m-0 mt-0.5">Stored securely in your private record</p>
        </div>
      </div>

      {/* Main Month Matrix Calendar */}
      <div className="fluetas-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <span className="section-title">FULL MONTH VIEW (TAP ANY DAY TO LOG)</span>

          {/* Phase Legend */}
          <div className="flex items-center gap-3 text-[0.68rem] font-semibold text-[#586151] flex-wrap">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C23B6B]" /><span>Menstrual (1-5)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2E6DA4]" /><span>Follicular (6-13)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" /><span>Ovulation (14-17)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7A4E9E]" /><span>Luteal (18-28)</span></div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[0.68rem] font-bold text-[#8A9482] uppercase py-1">
              {d}
            </div>
          ))}

          {monthDays.map(day => {
            const phase = getDayPhase(day);
            const isSelected = selectedDay === day;
            const dateKey = `${currentMonthYear}-${day.toString().padStart(2, '0')}`;
            const hasLogs = entries.some(e => e.date === dateKey);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`min-h-[52px] sm:min-h-[64px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#12160F] shadow-md scale-105 z-10'
                    : 'border-[rgba(18,22,15,0.08)] hover:border-[rgba(18,22,15,0.20)]'
                }`}
                style={{ backgroundColor: phase.bg }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-['Outfit'] font-bold text-xs sm:text-sm text-[#12160F]">
                    {day}
                  </span>
                  {hasLogs && <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />}
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
      <div className="fluetas-card p-5 bg-[#F2F4EE] border-[rgba(18,22,15,0.10)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div>
            <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
              LOGGING FOR DAY {selectedDay} ({selectedDateStr})
            </h3>
            <p className="text-xs text-[#586151] m-0 mt-0.5">
              Current Phase: <strong style={{ color: selectedPhase.color }}>{selectedPhase.name}</strong>
            </p>
          </div>
          <span className="text-xs text-[#586151]">
            {saving ? 'Saving...' : 'Tap pills to toggle & persist'}
          </span>
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
            const active = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                disabled={saving}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#2E7D32] text-white font-bold border-[#2E7D32] shadow-sm'
                    : 'bg-white text-[#586151] border-[rgba(18,22,15,0.12)] hover:text-[#12160F]'
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
