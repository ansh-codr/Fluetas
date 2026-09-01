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
  if (!db) return [];

  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const q = query(
    collection(db, 'sleepLogs', userId, 'entries'),
    where('date', 'in', dates),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);

  // Keep one entry per day (most recent)
  const byDate: Record<string, SleepEntry> = {};
  snap.docs.forEach(d => {
    const entry = d.data() as SleepEntry;
    byDate[entry.date] = entry;
  });

  return dates.map(date => ({
    date,
    durationHrs: byDate[date]?.durationHrs ?? 0,
    quality: byDate[date]?.quality,
  }));
}
