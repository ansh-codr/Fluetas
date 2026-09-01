'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  startWorkoutSession,
  completeWorkoutSession,
  getTodayWorkoutSessions,
  getRecentWorkoutSessions,
  WorkoutSession,
  WorkoutExercise,
} from '@/lib/services/workoutService';

interface UseWorkoutResult {
  todaySession: WorkoutSession | null;
  recentSessions: WorkoutSession[];
  activeSessionId: string | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  startSession: (name: string, type: string, exercises: WorkoutExercise[]) => Promise<string | null>;
  finishSession: (sessionId: string, exercises: WorkoutExercise[]) => Promise<void>;
  reload: () => Promise<void>;
}

export function useWorkout(): UseWorkoutResult {
  const { user } = useAuth();
  const [todaySession, setTodaySession] = useState<WorkoutSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [todaySessions, recent] = await Promise.all([
        getTodayWorkoutSessions(user.uid),
        getRecentWorkoutSessions(user.uid, 10),
      ]);
      // Find active session or most recently completed today
      const active = todaySessions.find(s => s.status === 'active');
      const completed = todaySessions.find(s => s.status === 'completed');
      setTodaySession(active ?? completed ?? null);
      setActiveSessionId(active?.id ?? null);
      setRecentSessions(recent);
    } catch {
      setError('Failed to load workout data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const startSession = useCallback(async (
    name: string,
    type: string,
    exercises: WorkoutExercise[]
  ): Promise<string | null> => {
    if (!user) return null;
    setSubmitting(true);
    setError(null);
    try {
      const id = await startWorkoutSession(user.uid, name, type, exercises);
      setActiveSessionId(id);
      await loadData();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workout.');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [user, loadData]);

  const finishSession = useCallback(async (
    sessionId: string,
    exercises: WorkoutExercise[]
  ) => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await completeWorkoutSession(user.uid, sessionId, exercises);
      setActiveSessionId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete workout.');
    } finally {
      setSubmitting(false);
    }
  }, [user, loadData]);

  return {
    todaySession,
    recentSessions,
    activeSessionId,
    loading,
    error,
    submitting,
    startSession,
    finishSession,
    reload: loadData,
  };
}
