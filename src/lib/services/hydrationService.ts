/**
 * Hydration Service
 * Persists to /hydrationLogs/{userId}/entries
 */

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTimelineEvent } from './timelineService';

export interface HydrationEntry {
  id?: string;
  userId: string;
  amount: number; // ml
  type: string;
  timestamp: Timestamp;
  date: string; // YYYY-MM-DD
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export async function logHydration(
  userId: string,
  amount: number,
  type = 'Pure Filtered Water'
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  if (amount <= 0 || amount > 5000) throw new Error('Hydration amount must be between 1 and 5000 ml');

  const now = Timestamp.now();
  await addDoc(collection(db, 'hydrationLogs', userId, 'entries'), {
    userId,
    amount,
    type,
    timestamp: now,
    date: todayDateStr(),
  });

  await addTimelineEvent(userId, {
    type: 'hydration_logged',
    title: 'Hydration Logged',
    description: `+${amount} ml — ${type}`,
    category: 'Wellness',
    badge: 'Logged',
    metadata: { amount, type },
  });
}

export async function getTodayHydrationEntries(userId: string): Promise<HydrationEntry[]> {
  if (!db) return [];
  const today = todayDateStr();
  const q = query(
    collection(db, 'hydrationLogs', userId, 'entries'),
    where('date', '==', today),
    orderBy('timestamp', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as HydrationEntry));
}

export interface DayHydration {
  date: string;
  totalMl: number;
}

export async function getWeeklyHydration(userId: string): Promise<DayHydration[]> {
  const trend = await getHydrationTrend(userId, 7);
  return trend.days.map(d => ({
    date: d.date,
    totalMl: d.totalMl,
  }));
}

export interface HydrationDayTrend {
  date: string;
  dayLabel: string;
  totalMl: number;
  targetMl: number;
  percentage: number;
  entriesCount: number;
}

export interface HydrationTrendSummary {
  days: HydrationDayTrend[];
  averageMl: number;
  totalMl: number;
  deltaMl: number;
  daysMeetingTarget: number;
  completionRate: number;
}

export async function getHydrationTrend(
  userId: string,
  days = 7,
  targetMl = 2500
): Promise<HydrationTrendSummary> {
  if (!db) {
    return {
      days: [],
      averageMl: 0,
      totalMl: 0,
      deltaMl: 0,
      daysMeetingTarget: 0,
      completionRate: 0,
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

  // Fetch entries for the date window
  const q = query(
    collection(db, 'hydrationLogs', userId, 'entries'),
    where('date', 'in', dates.slice(0, 30))
  );
  const snap = await getDocs(q);

  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};
  snap.docs.forEach(d => {
    const entry = d.data() as HydrationEntry;
    totals[entry.date] = (totals[entry.date] ?? 0) + (entry.amount || 0);
    counts[entry.date] = (counts[entry.date] ?? 0) + 1;
  });

  const dayTrends: HydrationDayTrend[] = dates.map((date, idx) => {
    const total = totals[date] ?? 0;
    const dObj = dateObjs[idx];
    const dayLabel = dObj.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date,
      dayLabel,
      totalMl: total,
      targetMl,
      percentage: Math.min(100, Math.round((total / targetMl) * 100)),
      entriesCount: counts[date] ?? 0,
    };
  });

  const totalMl = dayTrends.reduce((sum, d) => sum + d.totalMl, 0);
  const averageMl = Math.round(totalMl / numDays);
  const daysMeetingTarget = dayTrends.filter(d => d.totalMl >= targetMl).length;
  const completionRate = Math.round((daysMeetingTarget / numDays) * 100);

  // Simple delta: Compare average of latest half vs earlier half of the window
  const half = Math.floor(numDays / 2);
  let deltaMl = 0;
  if (half > 0) {
    const recentSum = dayTrends.slice(half).reduce((sum, d) => sum + d.totalMl, 0);
    const priorSum = dayTrends.slice(0, half).reduce((sum, d) => sum + d.totalMl, 0);
    const recentAvg = recentSum / (numDays - half);
    const priorAvg = priorSum / half;
    deltaMl = Math.round(recentAvg - priorAvg);
  }

  return {
    days: dayTrends,
    averageMl,
    totalMl,
    deltaMl,
    daysMeetingTarget,
    completionRate,
  };
}

/** Generic trend function matching standard prompt interface */
export async function getTrend(userId: string, metric = 'amount', days = 7) {
  return getHydrationTrend(userId, days);
}
