'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { useWorkout } from '@/hooks/useWorkout';
import { useExerciseDetail } from '@/hooks/useExercises';
import { WorkoutExercise, getRecentWorkoutSessions, WorkoutSession } from '@/lib/services/workoutService';
import {
  getActiveWorkoutPlan,
  generateWorkoutPlan,
  buildSessionExercisesFromPlanDay,
  getTodaysWorkoutDay,
  WorkoutPlan,
  PlanDay,
} from '@/lib/services/workoutPlanService';
import ExerciseVideoPlayer from '@/components/exercises/ExerciseVideoPlayer';
import ExerciseDetailModal from '@/components/exercises/ExerciseDetailModal';
import {
  Play,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Loader2,
  StopCircle,
  Video,
  ChevronRight,
  ChevronLeft,
  Info,
  Calendar,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function FluetasTrainPage() {
  const { user } = useAuth();
  const { healthProfile } = useUserProfile();
  const { todaySession, loading, submitting, startSession, finishSession, error: workoutHookError } = useWorkout();

  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [pastSessions, setPastSessions] = useState<WorkoutSession[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [activeSession, setActiveSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);

  // Load active workout plan and past sessions
  useEffect(() => {
    if (!user) {
      setPlanLoading(false);
      return;
    }

    Promise.all([
      getActiveWorkoutPlan(user.uid),
      getRecentWorkoutSessions(user.uid, 20),
    ])
      .then(([plan, recent]) => {
        setPastSessions(recent);
        if (plan && plan.days && plan.days.length > 0) {
          setActivePlan(plan);
          // Rotate day by completed sessions count
          const completedCount = recent.filter(s => s.status === 'completed').length;
          const todayDay = getTodaysWorkoutDay(plan, completedCount);
          setSelectedDayIdx(todayDay.dayIndex);

          const { exercises: builtEx, suggestions: sug } = buildSessionExercisesFromPlanDay(
            todayDay,
            plan.goal,
            recent
          );
          setExercises(builtEx);
          setSuggestions(sug);
        }
        setPlanLoading(false);
      })
      .catch(err => {
        console.error('[FluetasTrain] Load Error:', err);
        setPlanError(err?.message || 'Failed to load workout plan');
        setPlanLoading(false);
      });
  }, [user]);

  // Generate / Regenerate plan from profile
  const handleGeneratePlan = async () => {
    if (!user) return;
    setGeneratingPlan(true);
    setPlanError(null);

    try {
      const profileToUse = healthProfile || {
        primaryGoal: 'Build Muscle',
        fitnessLevel: 'Intermediate',
        daysPerWeek: 4,
        equipmentAccess: 'full_gym',
        injuryTags: [],
      };

      const newPlan = await generateWorkoutPlan(user.uid, profileToUse);
      setActivePlan(newPlan);
      setSelectedDayIdx(0);
      const { exercises: builtEx, suggestions: sug } = buildSessionExercisesFromPlanDay(
        newPlan.days[0],
        newPlan.goal,
        pastSessions
      );
      setExercises(builtEx);
      setSuggestions(sug);
    } catch (err: any) {
      console.error('[FluetasTrain] Plan Generation Error:', err);
      setPlanError(err?.message || 'Unable to generate plan with current restrictions.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Handle plan day selection
  const handleSelectDay = (dayIdx: number) => {
    if (!activePlan || activeSession) return;
    setSelectedDayIdx(dayIdx);
    const day = activePlan.days[dayIdx];
    const { exercises: builtEx, suggestions: sug } = buildSessionExercisesFromPlanDay(
      day,
      activePlan.goal,
      pastSessions
    );
    setExercises(builtEx);
    setSuggestions(sug);
    setActiveExerciseIdx(0);
  };

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

  // Sync with existing active session
  useEffect(() => {
    if (todaySession?.status === 'active' && todaySession.id) {
      setActiveSession(true);
      setSessionId(todaySession.id);
      if (todaySession.exercises && todaySession.exercises.length > 0) {
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
    if (activeSession || exercises.length === 0) return;
    const dayTitle = activePlan ? activePlan.days[selectedDayIdx]?.dayLabel : 'Workout Session';
    const id = await startSession(
      dayTitle || 'Structured Training Session',
      activePlan?.goal || 'Strength',
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
    if (activePlan) {
      const { exercises: freshEx } = buildSessionExercisesFromPlanDay(
        activePlan.days[selectedDayIdx],
        activePlan.goal,
        pastSessions
      );
      setExercises(freshEx);
    }
  };

  const completedSets = exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0);
  const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const sessionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const timerMins = Math.floor(timerSec / 60);
  const timerRemSecs = timerSec % 60;
  const timerLabel = `${timerMins}:${timerRemSecs.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Error Banners */}
      {(workoutHookError || planError) && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{workoutHookError || planError}</span>
        </div>
      )}

      {/* Program Header Banner */}
      <div className="fluetas-card p-5 sm:p-6 bg-white border border-[rgba(18,22,15,0.10)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 flex items-center gap-1">
                <Sparkles size={11} />
                {activePlan ? `${activePlan.title} · v${activePlan.version}` : 'Personalized Workout Engine'}
              </span>
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              FLUETAS TRAIN: {activePlan?.days[selectedDayIdx]?.dayLabel || 'TRAINING PROTOCOL'}
            </h1>
            <p className="text-[#586151] text-xs sm:text-sm m-0 mt-1">
              Biomechanical guidance, live form videos, and deterministic progressive overload.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto">
            <button
              onClick={handleGeneratePlan}
              disabled={generatingPlan || activeSession}
              className="px-3.5 py-2 rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] hover:border-[#2E7D32] text-[#586151] hover:text-[#12160F] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={generatingPlan ? 'animate-spin text-[#2E7D32]' : ''} />
              {generatingPlan ? 'Building Plan...' : activePlan ? 'Regenerate Plan' : 'Generate Plan'}
            </button>

            <Link
              href="/exercises"
              className="px-3.5 py-2 rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] hover:border-[#2E7D32] text-[#586151] hover:text-[#12160F] text-xs font-semibold flex items-center gap-1.5 transition-colors no-underline"
            >
              <Video size={14} className="text-[#2E7D32]" />
              Catalog
            </Link>

            {todaySession?.status === 'completed' ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-bold">
                <CheckCircle2 size={14} />
                Today&apos;s Session Complete!
              </div>
            ) : (
              <button
                onClick={activeSession ? handleFinishSession : handleStartSession}
                disabled={submitting || loading || planLoading || exercises.length === 0}
                className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer justify-center disabled:opacity-60 shadow-sm"
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
                  : "Start Today's Workout"}
              </button>
            )}
          </div>
        </div>

        {/* Plan Day Selector Tabs */}
        {activePlan && activePlan.days && activePlan.days.length > 1 && !activeSession && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[rgba(18,22,15,0.08)] overflow-x-auto no-scrollbar">
            <span className="text-[0.68rem] font-bold text-[#586151] uppercase shrink-0 mr-1 flex items-center gap-1">
              <Calendar size={12} /> Plan Days:
            </span>
            {activePlan.days.map((day, idx) => (
              <button
                key={day.dayIndex}
                onClick={() => handleSelectDay(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedDayIdx === idx
                    ? 'bg-[#2E7D32] text-white shadow-sm'
                    : 'bg-[#F2F4EE] border border-[rgba(18,22,15,0.08)] text-[#586151] hover:text-[#12160F]'
                }`}
              >
                {day.dayLabel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Workout Session & Video Streaming Player */}
      {activeSession && (
        <div className="fluetas-card p-4 sm:p-5 bg-white border-2 border-[#2E7D32]/40 flex flex-col gap-4 animate-slide-up shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(18,22,15,0.08)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-bold text-lg animate-pulse shrink-0 shadow-sm">
                ⏱️
              </div>
              <div>
                <p className="text-sm font-bold text-[#12160F] m-0">LIVE TRAINING SESSION IN PROGRESS</p>
                <p className="text-xs text-[#2E7D32] font-semibold m-0">
                  {completedSets}/{totalSets} sets logged ({sessionPct}%)
                </p>
              </div>
            </div>

            {/* Rest Timer */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] ${timerRunning ? 'text-[#2E7D32]' : 'text-[#586151]'}`}>
                Rest: {timerLabel}
              </div>
              <button
                onClick={() => { setTimerSec(90); setTimerRunning(true); }}
                className="px-3 py-1.5 rounded-lg bg-[#F2F4EE] text-xs font-semibold text-[#586151] hover:text-[#12160F] border border-[rgba(18,22,15,0.10)] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={13} /> 90s
              </button>
              <button
                onClick={() => { setTimerSec(120); setTimerRunning(true); }}
                className="px-3 py-1.5 rounded-lg bg-[#F2F4EE] text-xs font-semibold text-[#586151] hover:text-[#12160F] border border-[rgba(18,22,15,0.10)] flex items-center gap-1 cursor-pointer"
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

            {/* Right: Active Movement Info */}
            <div className="flex flex-col justify-between gap-3 h-full">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[0.65rem] font-bold text-[#2E7D32] uppercase tracking-wider">
                    Current Movement ({activeExerciseIdx + 1} of {exercises.length})
                  </span>
                  <button
                    onClick={() => setDetailModalId(currentExercise.id)}
                    className="text-xs text-[#2E6DA4] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Info size={13} /> Full Instructions
                  </button>
                </div>

                <h2 className="font-['Outfit'] text-lg font-bold text-[#12160F] m-0">
                  {currentExercise.name}
                </h2>
                <p className="text-xs text-[#2E6DA4] font-medium m-0 mt-0.5">
                  Focus: {currentExercise.targetMuscle}
                </p>

                {currentExercise.notes && (
                  <p className="text-xs text-[#586151] m-0 mt-2 bg-[#F2F4EE] p-3 rounded-xl border border-[rgba(18,22,15,0.06)] leading-relaxed">
                    💡 <strong>Progression / Cue:</strong> {currentExercise.notes}
                  </p>
                )}
              </div>

              {/* Next/Prev Exercise Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-[rgba(18,22,15,0.08)]">
                <button
                  disabled={activeExerciseIdx === 0}
                  onClick={() => setActiveExerciseIdx(i => Math.max(0, i - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] text-xs disabled:opacity-30 disabled:cursor-default flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous Movement
                </button>

                <button
                  disabled={activeExerciseIdx === exercises.length - 1}
                  onClick={() => setActiveExerciseIdx(i => Math.min(exercises.length - 1, i + 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/10 text-xs disabled:opacity-30 disabled:cursor-default flex items-center gap-1 cursor-pointer font-bold"
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
            <span className="text-xs text-[#586151]">Click &quot;Start Today&apos;s Workout&quot; to log sets live</span>
          ) : (
            <span className="text-xs text-[#2E7D32] font-semibold">
              Tap set badge to mark done &amp; trigger rest timer
            </span>
          )}
        </div>

        {exercises.map((ex, exIdx) => {
          const isCurrentActive = activeSession && activeExerciseIdx === exIdx;
          const completedExSets = ex.sets.filter(s => s.done).length;
          const suggestionNote = suggestions[ex.id] || ex.notes;

          return (
            <div
              key={ex.id}
              className={`fluetas-card p-4 sm:p-5 transition-all ${
                isCurrentActive ? 'border-[#2E7D32] shadow-sm bg-white' : 'hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div
                  onClick={() => { if (activeSession) setActiveExerciseIdx(exIdx); }}
                  className={`${activeSession ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-black flex items-center justify-center">
                      {exIdx + 1}
                    </span>
                    <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
                      {ex.name}
                    </h3>
                    {isCurrentActive && (
                      <span className="px-2 py-0.5 rounded text-[0.6rem] font-bold bg-[#2E7D32] text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#2E6DA4] font-medium m-0 mt-0.5 ml-8">
                    Focus: {ex.targetMuscle} · ({completedExSets}/{ex.sets.length} sets complete)
                  </p>
                  {suggestionNote && (
                    <p className="text-[0.7rem] text-[#2E7D32] font-medium m-0 mt-1 ml-8 flex items-center gap-1">
                      <ArrowUpRight size={12} />
                      {suggestionNote}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setDetailModalId(ex.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] hover:border-[#2E6DA4] text-xs text-[#2E6DA4] flex items-center gap-1 cursor-pointer transition-colors font-semibold"
                  >
                    <Video size={13} />
                    Watch Guide
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
                        ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32]'
                        : activeSession
                        ? 'bg-[#F2F4EE] border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] hover:border-[#2E7D32]'
                        : 'bg-[#F2F4EE] border-[rgba(18,22,15,0.08)] text-[#8A9482]'
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-[0.65rem] opacity-70 block">Set {set.set}</span>
                      <span className="text-[#12160F] font-bold">
                        {set.reps} reps @ {set.weight}kg
                      </span>
                    </div>
                    {set.done ? (
                      <CheckCircle2 size={16} className="text-[#2E7D32]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[rgba(18,22,15,0.20)]" />
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
