'use client';

import React, { useState } from 'react';
import {
  mockTrainingSplit,
  mockWorkoutExercises,
} from '@/lib/mock/dashboardData';
import {
  Play,
  CheckCircle2,
  Dumbbell,
  Flame,
  Clock,
  ChevronRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export default function FluetasTrainPage() {
  const [exercises, setExercises] = useState(mockWorkoutExercises);
  const [activeSession, setActiveSession] = useState(false);
  const [activeTimer, setActiveTimer] = useState(120); // 2 min rest timer

  const toggleSet = (exIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exIndex].sets[setIndex].done = !updated[exIndex].sets[setIndex].done;
    setExercises(updated);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Program Header */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#1A1F30] to-[#0A261E] border-[#10B981]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                <Sparkles size={11} />
                Hypertrophy & Rehab Protocol · Phase 3
              </span>
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              FLUETAS TRAIN: UPPER BODY POWER & STABILITY
            </h1>
            <p className="text-[#8B91B0] text-xs sm:text-sm m-0 mt-1">
              Customized by AI Coach & Dr. Anjali Mehta (Physio) for rotator cuff balance & posture.
            </p>
          </div>

          <button
            onClick={() => setActiveSession(!activeSession)}
            className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.35)] cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <Play size={14} fill="currentColor" />
            {activeSession ? 'Session in Progress (End)' : 'Start Today\'s Workout'}
          </button>
        </div>
      </div>

      {/* Active Workout Session Banner if started */}
      {activeSession && (
        <div className="fluetas-card p-4 bg-[#10B981]/10 border-[#10B981]/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981] text-black flex items-center justify-center font-bold text-lg animate-pulse">
              ⏱️
            </div>
            <div>
              <p className="text-sm font-bold text-[#E8EAF6] m-0">LIVE TRAINING SESSION ACTIVE</p>
              <p className="text-xs text-[#10B981] m-0">Rest Timer: 01:45 remaining between heavy sets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTimer(120)}
              className="px-3 py-1.5 rounded-lg bg-[#13161F] text-xs font-semibold text-[#8B91B0] hover:text-white border border-[#1E2133] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} /> Reset Timer (2m)
            </button>
            <button
              onClick={() => setActiveSession(false)}
              className="px-3 py-1.5 rounded-lg bg-[#10B981] text-black text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              Finish & Log
            </button>
          </div>
        </div>
      )}

      {/* Weekly Split Matrix */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="section-title">WEEKLY PROGRAM SPLIT</span>
          <span className="text-xs text-[#10B981] font-semibold">4/6 Sessions Completed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {mockTrainingSplit.map(day => (
            <div
              key={day.day}
              className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                day.active
                  ? 'bg-[#10B981]/15 border-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : day.status === 'Completed'
                  ? 'bg-[#0B0D14] border-[#1E2133] opacity-80'
                  : 'bg-[#13161F] border-[#1E2133]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-['Outfit'] text-xs font-bold text-[#E8EAF6]">{day.day}</span>
                {day.status === 'Completed' && <CheckCircle2 size={13} className="text-[#10B981]" />}
                {day.active && <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />}
              </div>

              <div>
                <p className="text-[0.72rem] font-bold text-[#E8EAF6] m-0 leading-tight truncate">{day.focus}</p>
                <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-0.5">{day.duration}</p>
              </div>

              <span className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded text-center ${
                day.active ? 'bg-[#10B981] text-black' : 'bg-[#1E2133] text-[#8B91B0]'
              }`}>
                {day.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Exercise Routine List */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="section-title">TODAY&apos;S EXERCISES ({exercises.length})</span>
          <span className="text-xs text-[#8B91B0]">Target Volume: 7,500 kg</span>
        </div>

        {exercises.map((ex, exIdx) => (
          <div
            key={ex.id}
            className="fluetas-card p-4 sm:p-5 hover:border-[#2A3050] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#10B981]/20 text-[#10B981] text-xs font-black flex items-center justify-center">
                    {exIdx + 1}
                  </span>
                  <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                    {ex.name}
                  </h3>
                </div>
                <p className="text-xs text-[#38BDF8] font-medium m-0 mt-0.5 ml-8">
                  Focus: {ex.targetMuscle}
                </p>
              </div>

              <p className="text-[0.72rem] text-[#8B91B0] italic m-0 bg-[#0B0D14] px-2.5 py-1 rounded-md border border-[#1E2133]">
                💡 {ex.notes}
              </p>
            </div>

            {/* Sets Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 ml-0 sm:ml-8">
              {ex.sets.map((set, setIdx) => (
                <button
                  key={setIdx}
                  onClick={() => toggleSet(exIdx, setIdx)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    set.done
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                      : 'bg-[#0B0D14] border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6]'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-[0.65rem] opacity-70 block">Set {set.set}</span>
                    <span className="text-[#E8EAF6] font-bold">{set.reps} reps @ {set.weight}</span>
                  </div>
                  {set.done ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border border-[#3A3F58]" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
