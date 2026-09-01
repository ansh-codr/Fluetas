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
  if (!db) return [];

  // Build date strings for last 7 days
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const q = query(
    collection(db, 'hydrationLogs', userId, 'entries'),
    where('date', 'in', dates)
  );
  const snap = await getDocs(q);

  const totals: Record<string, number> = {};
  snap.docs.forEach(d => {
    const entry = d.data() as HydrationEntry;
    totals[entry.date] = (totals[entry.date] ?? 0) + entry.amount;
  });

  return dates.map(date => ({
    date,
    totalMl: totals[date] ?? 0,
  }));
}
