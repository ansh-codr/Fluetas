'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/context/UserProfileContext';
import { useWorkout } from '@/hooks/useWorkout';
import { useExerciseDetail } from '@/hooks/useExercises';
import { WorkoutExercise, getRecentWorkoutSessions, WorkoutSession, ExerciseSet } from '@/lib/services/workoutService';
import {
  getActiveWorkoutPlan,
  generateWorkoutPlan,
  buildSessionExercisesFromPlanDay,
  getTodaysWorkoutDay,
  WorkoutPlan,
} from '@/lib/services/workoutPlanService';
import { isWorkoutPlanReady } from '@/lib/services/userService';
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
  Dumbbell,
} from 'lucide-react';

export default function FluetasTrainPage() {
  const { user } = useAuth();
  const { profile, healthProfile, loading: profileLoading } = useUserProfile();
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
    if (!user || !healthProfile) return;
    const readiness = isWorkoutPlanReady(profile, healthProfile);
    if (!readiness.ready) {
      setPlanError(`Incomplete profile: Missing [${readiness.missingFields.join(', ')}]`);
      return;
    }

    setGeneratingPlan(true);
    setPlanError(null);

    try {
      const newPlan = await generateWorkoutPlan(user.uid, healthProfile);
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

  // Active exercise video detail with personalized preference resolution
  const currentExercise = exercises[activeExerciseIdx] || exercises[0];
  const {
    exercise: activeVideoExercise,
    preferredVideo,
    videoExpired,
    handleVideoError,
    refreshVideoUrl,
  } = useExerciseDetail(currentExercise?.id || null, healthProfile);

  // Timer state
  const [timerSec, setTimerSec] = useState(90);
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

  // Rest countdown timer
  useEffect(() => {
    if (timerRunning && timerSec > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSec(s => s - 1);
      }, 1000);
    } else if (timerSec === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRunning, timerSec]);

  // Handle toggle individual set
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

  const readiness = isWorkoutPlanReady(profile, healthProfile);

  if (!planLoading && !profileLoading && !readiness.ready) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold">
              <Dumbbell size={18} />
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              FLUETAS TRAIN: PERSONALIZED PROTOCOL
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Deterministic progressive overload engine calibrated to your individual biometric profile.
          </p>
        </div>

        {/* Gated Incomplete Profile Notice */}
        <div className="fluetas-card p-6 sm:p-8 bg-white border border-[rgba(18,22,15,0.08)] text-center flex flex-col items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl">
            <AlertCircle size={28} />
          </div>
          <div className="max-w-md">
            <h2 className="font-['Outfit'] text-lg sm:text-xl font-bold text-[#12160F] m-0">
              Your personalized training plan isn&apos;t ready yet.
            </h2>
            <p className="text-xs sm:text-sm text-[#586151] m-0 mt-1.5 leading-relaxed">
              Complete your health and fitness profile first. FLUETAS requires your baseline fitness level, apparatus access, and injury screening to safely generate your training protocol.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.08)] text-left w-full max-w-md text-xs space-y-1.5">
            <span className="font-bold text-[#12160F] block">Required Information Missing:</span>
            <ul className="list-disc pl-4 text-[#586151] m-0 space-y-0.5">
              {readiness.missingFields.map((field, idx) => (
                <li key={idx}>{field}</li>
              ))}
            </ul>
          </div>

          <Link
            href="/onboarding"
            className="btn-primary bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 no-underline transition-colors shadow-xs"
          >
            <span>Complete Profile &amp; Unlock Training</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-5 max-w-5xl mx-auto w-full overflow-x-hidden ${activeSession ? 'pb-24 sm:pb-6' : ''}`}>
      {/* Error Banners */}
      {(workoutHookError || planError) && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{workoutHookError || planError}</span>
        </div>
      )}

      {/* Program Header Banner */}
      <div className="fluetas-card p-4 sm:p-6 bg-white border border-[rgba(18,22,15,0.10)] relative overflow-hidden">
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
              className="px-3.5 py-2 min-h-[44px] rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] hover:border-[#2E7D32] text-[#586151] hover:text-[#12160F] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={generatingPlan ? 'animate-spin text-[#2E7D32]' : ''} />
              {generatingPlan ? 'Building Plan...' : activePlan ? 'Regenerate Plan' : 'Generate Plan'}
            </button>

            <Link
              href="/exercises"
              className="px-3.5 py-2 min-h-[44px] rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] hover:border-[#2E7D32] text-[#586151] hover:text-[#12160F] text-xs font-semibold flex items-center gap-1.5 transition-colors no-underline"
            >
              <Video size={14} className="text-[#2E7D32]" />
              Catalog
            </Link>

            {todaySession?.status === 'completed' ? (
              <div className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-bold">
                <CheckCircle2 size={14} />
                Today&apos;s Session Complete!
              </div>
            ) : (
              <button
                onClick={activeSession ? handleFinishSession : handleStartSession}
                disabled={submitting || loading || planLoading || exercises.length === 0}
                className="btn-primary px-5 py-2.5 min-h-[44px] text-xs font-bold flex items-center gap-2 cursor-pointer justify-center disabled:opacity-60 shadow-sm"
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
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedDayIdx === idx
                    ? 'bg-[#2E7D32] text-white shadow-sm font-bold'
                    : 'bg-[#F2F4EE] border border-[rgba(18,22,15,0.08)] text-[#586151] hover:text-[#12160F]'
                }`}
              >
                {day.dayLabel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Workout Session & Video Showcase */}
      {activeSession && currentExercise && (
        <div className="fluetas-card p-4 sm:p-5 bg-white border-2 border-[#2E7D32]/40 flex flex-col gap-4 animate-slide-up shadow-sm">
          {/* Top Session Progress Bar */}
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
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <div className={`px-3 py-1.5 min-h-[38px] flex items-center rounded-xl font-mono text-sm font-bold bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] ${timerRunning ? 'text-[#2E7D32]' : 'text-[#586151]'}`}>
                Rest: {timerLabel}
              </div>
              <button
                onClick={() => { setTimerSec(90); setTimerRunning(true); }}
                className="px-3 py-1.5 min-h-[38px] rounded-xl bg-[#F2F4EE] text-xs font-semibold text-[#586151] hover:text-[#12160F] border border-[rgba(18,22,15,0.10)] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={13} /> 90s
              </button>
              <button
                onClick={() => { setTimerSec(120); setTimerRunning(true); }}
                className="px-3 py-1.5 min-h-[38px] rounded-xl bg-[#F2F4EE] text-xs font-semibold text-[#586151] hover:text-[#12160F] border border-[rgba(18,22,15,0.10)] flex items-center gap-1 cursor-pointer"
              >
                120s
              </button>
            </div>
          </div>

          {/* Current Active Exercise Showcase with Video */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Video Player Section (Full width on mobile, 7 cols on lg) */}
            <div className="lg:col-span-7 w-full overflow-hidden rounded-2xl">
              <ExerciseVideoPlayer
                videoUrl={preferredVideo?.videoUrl || activeVideoExercise?.videoUrl}
                thumbnailUrl={preferredVideo?.thumbnailUrl || activeVideoExercise?.thumbnailUrl}
                title={currentExercise.name}
                audience={preferredVideo?.audience}
                instructor={preferredVideo?.instructor}
                presentationType={preferredVideo?.presentationType}
                autoPlay={false}
                onVideoError={handleVideoError}
                onRefreshUrl={refreshVideoUrl}
                videoExpired={videoExpired}
              />
            </div>

            {/* Active Movement Info & Steps (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3 w-full">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[0.68rem] font-bold text-[#2E7D32] uppercase tracking-wider">
                    Current Movement ({activeExerciseIdx + 1} of {exercises.length})
                  </span>
                  <button
                    onClick={() => setDetailModalId(currentExercise.id)}
                    className="text-xs text-[#2E6DA4] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Info size={13} /> Full Instructions
                  </button>
                </div>

                <h2 className="font-['Outfit'] text-lg sm:text-xl font-bold text-[#12160F] m-0">
                  {currentExercise.name}
                </h2>
                <p className="text-xs text-[#2E6DA4] font-semibold m-0 mt-0.5">
                  Target: {currentExercise.targetMuscle}
                </p>

                {currentExercise.notes && (
                  <div className="text-xs text-[#586151] m-0 mt-3 bg-[#F2F4EE] p-3.5 rounded-xl border border-[rgba(18,22,15,0.06)] leading-relaxed">
                    💡 <strong>Progression / Cue:</strong> {currentExercise.notes}
                  </div>
                )}
              </div>

              {/* Movement Navigation Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(18,22,15,0.08)] gap-2">
                <button
                  disabled={activeExerciseIdx === 0}
                  onClick={() => setActiveExerciseIdx(i => Math.max(0, i - 1))}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-[rgba(18,22,15,0.12)] text-[#586151] hover:text-[#12160F] text-xs font-semibold disabled:opacity-30 disabled:cursor-default flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft size={15} /> Prev Movement
                </button>

                <button
                  disabled={activeExerciseIdx === exercises.length - 1}
                  onClick={() => setActiveExerciseIdx(i => Math.min(exercises.length - 1, i + 1))}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#2E7D32] text-white hover:bg-[#256628] text-xs font-bold disabled:opacity-30 disabled:cursor-default flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Next Movement</span>
                  <ChevronRight size={15} />
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
            <span className="text-xs text-[#2E7D32] font-semibold hidden sm:inline">
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
                isCurrentActive ? 'border-2 border-[#2E7D32] shadow-sm bg-white' : 'hover:shadow-md bg-white'
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
                    className="px-3 py-1.5 min-h-[36px] rounded-lg bg-[#F2F4EE] border border-[rgba(18,22,15,0.10)] hover:border-[#2E6DA4] text-xs text-[#2E6DA4] flex items-center gap-1 cursor-pointer transition-colors font-semibold"
                  >
                    <Video size={13} />
                    Watch Guide
                  </button>
                </div>
              </div>

              {/* Sets Matrix with Large Touch Targets (>= 48px) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 ml-0 sm:ml-8">
                {ex.sets.map((set, setIdx) => (
                  <button
                    key={setIdx}
                    onClick={() => toggleSet(exIdx, setIdx)}
                    disabled={!activeSession}
                    className={`min-h-[50px] p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all select-none ${
                      activeSession ? 'cursor-pointer active:scale-98' : 'cursor-default'
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
                      <CheckCircle2 size={18} className="text-[#2E7D32] shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[rgba(18,22,15,0.25)] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar for Mobile Active Session */}
      {activeSession && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[rgba(18,22,15,0.12)] p-3 z-40 flex sm:hidden items-center justify-between shadow-lg">
          <div>
            <span className="text-[0.65rem] font-bold text-[#586151] block uppercase">Current Movement</span>
            <span className="text-xs font-bold text-[#12160F] truncate max-w-[150px] block">
              {currentExercise?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1.5 rounded-lg bg-[#F2F4EE] font-mono text-xs font-bold text-[#2E7D32]">
              {timerLabel}
            </div>

            <button
              disabled={activeExerciseIdx === exercises.length - 1}
              onClick={() => setActiveExerciseIdx(i => Math.min(exercises.length - 1, i + 1))}
              className="btn-primary min-h-[44px] px-3.5 py-2 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

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
