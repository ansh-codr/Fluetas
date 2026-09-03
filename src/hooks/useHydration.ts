'use client';

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import {
  logHydration,
  updateHydrationEntry,
  deleteHydrationEntry,
  getWeeklyHydration,
  HydrationEntry,
  DayHydration,
} from '@/lib/services/hydrationService';
import { useUserProfile } from '@/context/UserProfileContext';

interface UseHydrationResult {
  logs: HydrationEntry[];
  totalMl: number;
  goalMl: number | null;
  hasPersonalizedGoal: boolean;
  pct: number;
  weeklyData: DayHydration[];
  loading: boolean;
  error: string | null;
  addWater: (amount: number, type?: string) => Promise<void>;
  updateWater: (entryId: string, amount: number, type?: string) => Promise<void>;
  deleteWater: (entryId: string) => Promise<void>;
  submitting: boolean;
  reload: () => void;
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export function useHydration(): UseHydrationResult {
  const { user } = useAuth();
  const { profile, healthProfile } = useUserProfile();
  const [logs, setLogs] = useState<HydrationEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayHydration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Legitimate goal calculation from stored biometrics, or null if unconfigured
  const goalMl: number | null = healthProfile?.hydrationTargetL
    ? Math.round(healthProfile.hydrationTargetL * 1000)
    : profile?.weightKg && profile.weightKg > 0
    ? Math.round(profile.weightKg * 35)
    : null;

  const hasPersonalizedGoal = goalMl !== null;
  const totalMl = logs.reduce((acc, l) => acc + (l.amount || 0), 0);
  const pct = goalMl ? Math.min(100, Math.round((totalMl / goalMl) * 100)) : 0;

  const reload = useCallback(() => {
    setReloadTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const today = todayDateStr();

    // Query entries for today without compound index requirement
    const q = query(
      collection(db, 'hydrationLogs', user.uid, 'entries'),
      where('date', '==', today)
    );

    const unsub = onSnapshot(
      q,
      snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as HydrationEntry));
        items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setLogs(items);
        setError(null);
        setLoading(false);
      },
      err => {
        console.warn('[useHydration] Snapshot error:', err);
        setError('Unable to load your hydration records right now.');
        setLoading(false);
      }
    );

    // Load weekly data
    getWeeklyHydration(user.uid)
      .then(res => setWeeklyData(res || []))
      .catch(() => setWeeklyData([]));

    return () => unsub();
  }, [user, reloadTrigger]);

  const addWater = useCallback(async (amount: number, type = 'Pure Filtered Water') => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await logHydration(user.uid, amount, type);
      getWeeklyHydration(user.uid).then(res => setWeeklyData(res || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log hydration.');
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  const updateWater = useCallback(async (entryId: string, amount: number, type?: string) => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateHydrationEntry(user.uid, entryId, amount, type);
      getWeeklyHydration(user.uid).then(res => setWeeklyData(res || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hydration.');
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  const deleteWater = useCallback(async (entryId: string) => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteHydrationEntry(user.uid, entryId);
      getWeeklyHydration(user.uid).then(res => setWeeklyData(res || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete hydration entry.');
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  return {
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
  };
}
