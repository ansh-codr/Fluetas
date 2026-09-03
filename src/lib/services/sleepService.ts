/**
 * Sleep Service
 * Persists to /sleepLogs/{userId}/entries
 */

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTimelineEvent } from './timelineService';

export interface SleepEntry {
  id?: string;
  userId: string;
  sleepTime: string;   // HH:MM (24h)
  wakeTime: string;    // HH:MM (24h)
  durationHrs: number;
  quality?: number;    // 1-10
  date: string;        // YYYY-MM-DD (the date user woke up)
  timestamp: Timestamp;
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

function calcDurationHrs(sleepTime: string, wakeTime: string): number {
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let sleepMins = sh * 60 + sm;
  let wakeMins = wh * 60 + wm;
  // Handle midnight crossover
  if (wakeMins <= sleepMins) wakeMins += 24 * 60;
  return Math.round(((wakeMins - sleepMins) / 60) * 10) / 10;
}

export async function logSleep(
  userId: string,
  sleepTime: string,
  wakeTime: string,
  quality?: number,
  dateOverride?: string
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const durationHrs = calcDurationHrs(sleepTime, wakeTime);
  if (durationHrs < 0.5 || durationHrs > 24) {
    throw new Error('Sleep duration appears invalid. Please check your sleep and wake times.');
  }
  if (quality !== undefined && (quality < 1 || quality > 10)) {
    throw new Error('Quality rating must be between 1 and 10.');
  }

  const date = dateOverride ?? todayDateStr();
  const entry: Omit<SleepEntry, 'id'> = {
    userId,
    sleepTime,
    wakeTime,
    durationHrs,
    quality,
    date,
    timestamp: Timestamp.now(),
  };

  await addDoc(collection(db, 'sleepLogs', userId, 'entries'), entry);

  await addTimelineEvent(userId, {
    type: 'sleep_logged',
    title: 'Sleep Recorded',
    description: `${durationHrs}h logged${quality ? ` · Quality: ${quality}/10` : ''}`,
    category: 'Wellness',
    badge: 'Logged',
    metadata: { durationHrs, sleepTime, wakeTime, quality },
  });
}

export async function getLatestSleepEntry(userId: string): Promise<SleepEntry | null> {
  if (!db) return null;
  const q = query(
    collection(db, 'sleepLogs', userId, 'entries'),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as SleepEntry;
}

export interface DaySleep {
  date: string;
  durationHrs: number;
  quality?: number;
}

export async function getWeeklySleep(userId: string): Promise<DaySleep[]> {
  const trend = await getSleepTrend(userId, 7);
  return trend.days.map(d => ({
    date: d.date,
    durationHrs: d.durationHrs,
    quality: d.quality,
  }));
}

export interface SleepDayTrend {
  date: string;
  dayLabel: string;
  durationHrs: number;
  quality?: number;
  targetHrs: number;
  isLogged: boolean;
}

export interface SleepTrendSummary {
  days: SleepDayTrend[];
  avgDurationHrs: number;
  avgQuality: number | null;
  durationDelta: number;
  loggedDaysCount: number;
}

export async function getSleepTrend(
  userId: string,
  days = 7,
  targetHrs = 8
): Promise<SleepTrendSummary> {
  if (!db) {
    return {
      days: [],
      avgDurationHrs: 0,
      avgQuality: null,
      durationDelta: 0,
      loggedDaysCount: 0,
    };
  }

  const numDays = Math.min(Math.max(days, 1), 30);
  const dates: string[] = [];
  const dateObjs: Date[] = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
    dateObjs.push(d);
  }

  const q = query(
    collection(db, 'sleepLogs', userId, 'entries'),
    where('date', 'in', dates.slice(0, 30))
  );
  const snap = await getDocs(q);

  const byDate: Record<string, SleepEntry> = {};
  snap.docs.forEach(d => {
    const entry = d.data() as SleepEntry;
    byDate[entry.date] = entry;
  });

  const dayTrends: SleepDayTrend[] = dates.map((date, idx) => {
    const entry = byDate[date];
    const dObj = dateObjs[idx];
    const dayLabel = dObj.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date,
      dayLabel,
      durationHrs: entry?.durationHrs ?? 0,
      quality: entry?.quality,
      targetHrs,
      isLogged: Boolean(entry),
    };
  });

  const loggedDays = dayTrends.filter(d => d.isLogged);
  const loggedDaysCount = loggedDays.length;
  const totalDuration = loggedDays.reduce((sum, d) => sum + d.durationHrs, 0);
  const avgDurationHrs = loggedDaysCount > 0 ? Math.round((totalDuration / loggedDaysCount) * 10) / 10 : 0;

  const qualityEntries = loggedDays.filter(d => d.quality !== undefined);
  const avgQuality = qualityEntries.length > 0
    ? Math.round((qualityEntries.reduce((sum, d) => sum + (d.quality ?? 0), 0) / qualityEntries.length) * 10) / 10
    : null;

  // Delta calculation: recent half vs prior half
  const half = Math.floor(numDays / 2);
  let durationDelta = 0;
  if (half > 0) {
    const recentLogged = dayTrends.slice(half).filter(d => d.isLogged);
    const priorLogged = dayTrends.slice(0, half).filter(d => d.isLogged);
    if (recentLogged.length > 0 && priorLogged.length > 0) {
      const recentAvg = recentLogged.reduce((s, d) => s + d.durationHrs, 0) / recentLogged.length;
      const priorAvg = priorLogged.reduce((s, d) => s + d.durationHrs, 0) / priorLogged.length;
      durationDelta = Math.round((recentAvg - priorAvg) * 10) / 10;
    }
  }

  return {
    days: dayTrends,
    avgDurationHrs,
    avgQuality,
    durationDelta,
    loggedDaysCount,
  };
}

/** Generic trend function matching standard prompt interface */
export async function getTrend(userId: string, metric = 'duration', days = 7) {
  return getSleepTrend(userId, days);
}
