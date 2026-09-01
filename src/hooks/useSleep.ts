'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  logSleep,
  getLatestSleepEntry,
  getWeeklySleep,
  SleepEntry,
  DaySleep,
} from '@/lib/services/sleepService';
import { useUserProfile } from '@/context/UserProfileContext';

interface UseSleepResult {
  todaySleep: SleepEntry | null;
  weeklySleep: DaySleep[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  logSleepEntry: (sleepTime: string, wakeTime: string, quality?: number) => Promise<void>;
  targetHrs: number;
}

export function useSleep(): UseSleepResult {
  const { user } = useAuth();
  const { healthProfile } = useUserProfile();
  const [todaySleep, setTodaySleep] = useState<SleepEntry | null>(null);
  const [weeklySleep, setWeeklySleep] = useState<DaySleep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const targetHrs = healthProfile?.sleepTargetHrs ?? 8;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [latest, weekly] = await Promise.all([
        getLatestSleepEntry(user.uid),
        getWeeklySleep(user.uid),
      ]);
      setTodaySleep(latest);
      setWeeklySleep(weekly);
    } catch {
      setError('Failed to load sleep data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const logSleepEntry = useCallback(async (sleepTime: string, wakeTime: string, quality?: number) => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await logSleep(user.uid, sleepTime, wakeTime, quality);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log sleep.');
    } finally {
      setSubmitting(false);
    }
  }, [user, loadData]);

  return { todaySleep, weeklySleep, loading, error, submitting, logSleepEntry, targetHrs };
}
