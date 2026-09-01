'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWorkout } from '@/hooks/useWorkout';
import { useExerciseDetail } from '@/hooks/useExercises';
import { WorkoutExercise } from '@/lib/services/workoutService';
import ExerciseVideoPlayer from '@/components/exercises/ExerciseVideoPlayer';
import ExerciseDetailModal from '@/components/exercises/ExerciseDetailModal';
import {
  Play,
  CheckCircle2,
  Dumbbell,
  Clock,
  Sparkles,
  RotateCcw,
  Loader2,
  StopCircle,
  Video,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';

const PROGRAM_EXERCISES: (WorkoutExercise & { slugId: string })[] = [
  {
    id: 'barbell-bench-press',
    slugId: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    targetMuscle: 'Pectoralis Major (Mid/Lower Chest)',
    notes: 'Retract scapulae; drive through legs; maintain 3-second eccentric tempo.',
    sets: [
      { set: 1, reps: '8', weight: '80 kg', done: false },
      { set: 2, reps: '8', weight: '85 kg', done: false },
      { set: 3, reps: '6', weight: '90 kg', done: false },
      { set: 4, reps: '6', weight: '90 kg', done: false },
    ],
  },
  {
    id: 'incline-dumbbell-press',
    slugId: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    targetMuscle: 'Clavicular Pecs (Upper Chest)',
    notes: 'Set bench to 30-degree incline; squeeze at top without clanking dumbbells.',
    sets: [
      { set: 1, reps: '10', weight: '32 kg', done: false },
      { set: 2, reps: '10', weight: '32 kg', done: false },
      { set: 3, reps: '8', weight: '34 kg', done: false },
    ],
  },
  {
    id: 'standing-overhead-press',
    slugId: 'standing-overhead-press',
    name: 'Standing Overhead Barbell Press',
    targetMuscle: 'Anterior & Lateral Deltoids',
    notes: 'Lock glutes; head clears bar path; full lockout at apex.',
    sets: [
      { set: 1, reps: '8', weight: '50 kg', done: false },
      { set: 2, reps: '8', weight: '55 kg', done: false },
      { set: 3, reps: '6', weight: '60 kg', done: false },
    ],
  },
  {
    id: 'cable-chest-fly',
    slugId: 'cable-chest-fly',
    name: 'High-to-Low Cable Chest Fly',
    targetMuscle: 'Sternal Pectoralis Isolation',
    notes: '1-second peak contraction at center; control the eccentric stretch.',
    sets: [
      { set: 1, reps: '12', weight: '15 kg/side', done: false },
      { set: 2, reps: '12', weight: '17.5 kg/side', done: false },
      { set: 3, reps: '10', weight: '20 kg/side', done: false },
    ],
  },
  {
    id: 'dumbbell-hammer-curl',
    slugId: 'dumbbell-hammer-curl',
    name: 'Standing Dumbbell Hammer Curl',
    targetMuscle: 'Brachialis & Forearms',
    notes: 'Neutral grip; isolate elbow flexors without swinging torso.',
    sets: [
      { set: 1, reps: '12', weight: '18 kg', done: false },
      { set: 2, reps: '10', weight: '20 kg', done: false },
      { set: 3, reps: '10', weight: '20 kg', done: false },
    ],
  },
];

export default function FluetasTrainPage() {
  const { activeSessionId, todaySession, loading, submitting, startSession, finishSession, error } = useWorkout();
  const [exercises, setExercises] = useState<WorkoutExercise[]>(PROGRAM_EXERCISES);
  const [activeSession, setActiveSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);

  // Active exercise video detail
  const currentExercise = exercises[activeExerciseIdx] || exercises[0];
  const {
    exercise: activeVideoExercise,
    videoExpired,
    handleVideoError,
    refreshVideoUrl,
  } = useExerciseDetail(currentExercise?.id || null);

  // Timer state
  const [timerSec, setTimerSec] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with existing session
  useEffect(() => {
    if (todaySession?.status === 'active' && todaySession.id) {
      setActiveSession(true);
      setSessionId(todaySession.id);
      if (todaySession.exercises && todaySession.exercises.length === exercises.length) {
        setExercises(todaySession.exercises);
      }
    }
  }, [todaySession]);

  // Rest timer countdown
  useEffect(() => {
    if (timerRunning && timerSec > 0) {
      timerRef.current = setTimeout(() => setTimerSec(t => t - 1), 1000);
    } else if (timerSec <= 0) {
      setTimerRunning(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerRunning, timerSec]);

  const toggleSet = (exIndex: number, setIndex: number) => {
    if (!activeSession) return;
    const updated = exercises.map((ex, i) => {
      if (i !== exIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, j) => (j !== setIndex ? s : { ...s, done: !s.done })),
      };
    });
    setExercises(updated);
    if (!exercises[exIndex].sets[setIndex].done) {
      setTimerSec(90);
      setTimerRunning(true);
    }
  };

  const handleStartSession = async () => {
    if (activeSession) return;
    const id = await startSession(
      'Upper Body Power & Stability',
      'Strength',
      exercises
    );
    if (id) {
      setSessionId(id);
      setActiveSession(true);
      setActiveExerciseIdx(0);
    }
  };

  const handleFinishSession = async () => {
    if (!sessionId) return;
    setTimerRunning(false);
    await finishSession(sessionId, exercises);
    setActiveSession(false);
    setSessionId(null);
    setExercises(PROGRAM_EXERCISES.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s, done: false })) })));
  };

  const completedSets = exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0);
  const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const sessionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const timerMins = Math.floor(timerSec / 60);
  const timerRemSecs = timerSec % 60;
  const timerLabel = `${timerMins}:${timerRemSecs.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Program Header */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#1A1F30] to-[#0A261E] border-[#10B981]/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                <Sparkles size={11} />
                Hypertrophy &amp; Rehab Protocol · Phase 3
              </span>
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              FLUETAS TRAIN: UPPER BODY POWER &amp; STABILITY
            </h1>
            <p className="text-[#8B91B0] text-xs sm:text-sm m-0 mt-1">
              Live API-powered movement videos, biomechanical cues, and set logging.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto">
            <Link
              href="/exercises"
              className="px-3.5 py-2 rounded-xl bg-[#13161F] border border-[#1E2133] hover:border-[#10B981]/40 text-[#8B91B0] hover:text-[#E8EAF6] text-xs font-semibold flex items-center gap-1.5 transition-colors no-underline"
            >
              <Video size={14} className="text-[#10B981]" />
              Browse Movement Library
            </Link>

            {todaySession?.status === 'completed' ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-bold">
                <CheckCircle2 size={14} />
                Today's Session Complete!
              </div>
            ) : (
              <button
                onClick={activeSession ? handleFinishSession : handleStartSession}
                disabled={submitting || loading}
                className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(16,185,129,0.35)] cursor-pointer justify-center disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : activeSession ? (
                  <StopCircle size={14} />
                ) : (
                  <Play size={14} fill="currentColor" />
                )}
                {submitting
                  ? 'Saving...'
                  : activeSession
                  ? 'Finish & Log Workout'
                  : 'Start Today\'s Workout'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Workout Session & Video Streaming Player */}
      {activeSession && (
        <div className="fluetas-card p-4 sm:p-5 bg-gradient-to-br from-[#13161F] to-[#0A1A24] border-[#10B981]/40 flex flex-col gap-4 animate-slide-up">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2133]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981] text-black flex items-center justify-center font-bold text-lg animate-pulse shrink-0">
                ⏱️
              </div>
              <div>
                <p className="text-sm font-bold text-[#E8EAF6] m-0">LIVE TRAINING SESSION IN PROGRESS</p>
                <p className="text-xs text-[#10B981] m-0">
                  {completedSets}/{totalSets} sets logged ({sessionPct}%)
                </p>
              </div>
            </div>

            {/* Rest Timer */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold bg-[#0B0D14] border border-[#1E2133] ${timerRunning ? 'text-[#10B981]' : 'text-[#3A3F58]'}`}>
                Rest: {timerLabel}
              </div>
              <button
                onClick={() => { setTimerSec(90); setTimerRunning(true); }}
                className="px-3 py-1.5 rounded-lg bg-[#13161F] text-xs font-semibold text-[#8B91B0] hover:text-white border border-[#1E2133] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={13} /> 90s
              </button>
              <button
                onClick={() => { setTimerSec(120); setTimerRunning(true); }}
                className="px-3 py-1.5 rounded-lg bg-[#13161F] text-xs font-semibold text-[#8B91B0] hover:text-white border border-[#1E2133] flex items-center gap-1 cursor-pointer"
              >
                120s
              </button>
            </div>
          </div>

          {/* Current Active Exercise Showcase with Video */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            {/* Left: Video Player */}
            <div className="w-full">
              <ExerciseVideoPlayer
                videoUrl={activeVideoExercise?.videoUrl}
                thumbnailUrl={activeVideoExercise?.thumbnailUrl}
                title={currentExercise.name}
                autoPlay={false}
                onVideoError={handleVideoError}
                onRefreshUrl={refreshVideoUrl}
                videoExpired={videoExpired}
              />
            </div>

            {/* Right: Active Movement Info & Quick Switcher */}
            <div className="flex flex-col justify-between gap-3 h-full">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[0.65rem] font-bold text-[#10B981] uppercase tracking-wider">
                    Current Movement ({activeExerciseIdx + 1} of {exercises.length})
                  </span>
                  <button
                    onClick={() => setDetailModalId(currentExercise.id)}
                    className="text-xs text-[#38BDF8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Info size={13} /> Full Instructions
                  </button>
                </div>

                <h2 className="font-['Outfit'] text-lg font-bold text-[#E8EAF6] m-0">
                  {currentExercise.name}
                </h2>
                <p className="text-xs text-[#38BDF8] font-medium m-0 mt-0.5">
                  Focus: {currentExercise.targetMuscle}
                </p>

                {currentExercise.notes && (
                  <p className="text-xs text-[#8B91B0] m-0 mt-2 bg-[#0B0D14] p-3 rounded-xl border border-[#1E2133] leading-relaxed">
                    💡 <strong>Form Note:</strong> {currentExercise.notes}
                  </p>
                )}
              </div>

              {/* Next/Prev Exercise Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1E2133]">
                <button
                  disabled={activeExerciseIdx === 0}
                  onClick={() => setActiveExerciseIdx(i => Math.max(0, i - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#1E2133] text-[#8B91B0] hover:text-white text-xs disabled:opacity-30 disabled:cursor-default flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous Movement
                </button>

                <button
                  disabled={activeExerciseIdx === exercises.length - 1}
                  onClick={() => setActiveExerciseIdx(i => Math.min(exercises.length - 1, i + 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#1E2133] text-[#10B981] hover:bg-[#10B981]/10 text-xs disabled:opacity-30 disabled:cursor-default flex items-center gap-1 cursor-pointer font-bold"
                >
                  Next Movement <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routine Exercise List */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="section-title">TODAY&apos;S EXERCISES ({exercises.length})</span>
          {!activeSession ? (
            <span className="text-xs text-[#8B91B0]">Start workout to check off live sets</span>
          ) : (
            <span className="text-xs text-[#10B981] font-semibold">
              Click set to toggle completion &amp; trigger rest timer
            </span>
          )}
        </div>

        {exercises.map((ex, exIdx) => {
          const isCurrentActive = activeSession && activeExerciseIdx === exIdx;
          const completedExSets = ex.sets.filter(s => s.done).length;

          return (
            <div
              key={ex.id}
              className={`fluetas-card p-4 sm:p-5 transition-all ${
                isCurrentActive ? 'border-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.15)] bg-[#13161F]' : 'hover:border-[#2A3050]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div
                  onClick={() => { if (activeSession) setActiveExerciseIdx(exIdx); }}
                  className={`${activeSession ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#10B981]/20 text-[#10B981] text-xs font-black flex items-center justify-center">
                      {exIdx + 1}
                    </span>
                    <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                      {ex.name}
                    </h3>
                    {isCurrentActive && (
                      <span className="px-2 py-0.5 rounded text-[0.6rem] font-bold bg-[#10B981] text-black animate-pulse">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#38BDF8] font-medium m-0 mt-0.5 ml-8">
                    Focus: {ex.targetMuscle} · ({completedExSets}/{ex.sets.length} sets complete)
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setDetailModalId(ex.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#0B0D14] border border-[#1E2133] hover:border-[#38BDF8]/50 text-xs text-[#38BDF8] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Video size={13} />
                    Watch Video &amp; Form Guide
                  </button>
                </div>
              </div>

              {/* Sets Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 ml-0 sm:ml-8">
                {ex.sets.map((set, setIdx) => (
                  <button
                    key={setIdx}
                    onClick={() => toggleSet(exIdx, setIdx)}
                    disabled={!activeSession}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                      activeSession ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      set.done
                        ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                        : activeSession
                        ? 'bg-[#0B0D14] border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] hover:border-[#2A3050]'
                        : 'bg-[#0B0D14] border-[#1E2133] text-[#3A3F58]'
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-[0.65rem] opacity-70 block">Set {set.set}</span>
                      <span className="text-[#E8EAF6] font-bold">
                        {set.reps} reps @ {set.weight}
                      </span>
                    </div>
                    {set.done ? (
                      <CheckCircle2 size={16} className="text-[#10B981]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#3A3F58]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for In-Depth Demonstration & Form Guide */}
      {detailModalId && (
        <ExerciseDetailModal
          exerciseId={detailModalId}
          onClose={() => setDetailModalId(null)}
        />
      )}
    </div>
  );
}
