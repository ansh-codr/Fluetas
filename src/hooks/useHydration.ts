'use client';

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
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
  goalMl: number;
  pct: number;
  weeklyData: DayHydration[];
  loading: boolean;
  error: string | null;
  addWater: (amount: number, type?: string) => Promise<void>;
  updateWater: (entryId: string, amount: number, type?: string) => Promise<void>;
  deleteWater: (entryId: string) => Promise<void>;
  submitting: boolean;
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export function useHydration(): UseHydrationResult {
  const { user } = useAuth();
  const { healthProfile } = useUserProfile();
  const [logs, setLogs] = useState<HydrationEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayHydration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goalMl = (healthProfile?.hydrationTargetL ?? 2.5) * 1000;
  const totalMl = logs.reduce((acc, l) => acc + l.amount, 0);
  const pct = Math.min(100, Math.round((totalMl / goalMl) * 100));

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }

    const today = todayDateStr();
    const q = query(
      collection(db, 'hydrationLogs', user.uid, 'entries'),
      where('date', '==', today),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as HydrationEntry)));
      setLoading(false);
    }, err => {
      setError('Failed to load hydration data.');
      setLoading(false);
    });

    // Load weekly data
    getWeeklyHydration(user.uid).then(setWeeklyData);

    return () => unsub();
  }, [user]);

  const addWater = useCallback(async (amount: number, type = 'Pure Filtered Water') => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await logHydration(user.uid, amount, type);
      getWeeklyHydration(user.uid).then(setWeeklyData);
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
      getWeeklyHydration(user.uid).then(setWeeklyData);
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
      getWeeklyHydration(user.uid).then(setWeeklyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete hydration entry.');
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  return { logs, totalMl, goalMl, pct, weeklyData, loading, error, addWater, updateWater, deleteWater, submitting };
}
