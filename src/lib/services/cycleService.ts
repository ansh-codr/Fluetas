/**
 * Cycle Service (FLUETAS HER)
 * Persists to /cycleLogs/{userId}/entries
 * This data is treated as sensitive — access strictly owner-only.
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
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTimelineEvent } from './timelineService';

export type FlowLevel = 'Light' | 'Medium' | 'Heavy' | 'Spotting' | 'None';
export type MoodLevel = 'Great' | 'Good' | 'Neutral' | 'Low' | 'Anxious' | 'Irritable';
export type EnergyLevel = 'High' | 'Medium' | 'Low' | 'Exhausted';

export interface CycleEntry {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  isPeriodStart?: boolean;
  isPeriodEnd?: boolean;
  flow?: FlowLevel;
  mood?: MoodLevel;
  energy?: EnergyLevel;
  symptoms?: string[]; // e.g. ['Cramps', 'Bloating', 'Headache']
  notes?: string;
  timestamp: Timestamp;
}

export async function logCycleEntry(
  userId: string,
  data: Omit<CycleEntry, 'id' | 'userId' | 'timestamp'>
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const entry: Omit<CycleEntry, 'id'> = {
    userId,
    ...data,
    timestamp: Timestamp.now(),
  };

  const ref = await addDoc(collection(db, 'cycleLogs', userId, 'entries'), entry);

  await addTimelineEvent(userId, {
    type: 'cycle_logged',
    title: 'Cycle Entry Logged',
    description: `${data.date}${data.flow ? ` · Flow: ${data.flow}` : ''}${data.mood ? ` · Mood: ${data.mood}` : ''}`,
    category: 'Her',
    badge: 'Logged',
    metadata: { date: data.date, isPeriodStart: data.isPeriodStart },
  });

  return ref.id;
}

export async function getRecentCycleEntries(
  userId: string,
  count = 30
): Promise<CycleEntry[]> {
  if (!db) return [];
  const q = query(
    collection(db, 'cycleLogs', userId, 'entries'),
    orderBy('date', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CycleEntry));
}

export async function deleteCycleEntry(userId: string, entryId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'cycleLogs', userId, 'entries', entryId));
}

export interface CycleDayTrend {
  date: string;
  dayLabel: string;
  flow?: FlowLevel;
  mood?: MoodLevel;
  energy?: EnergyLevel;
  symptomCount: number;
  isPeriodDay: boolean;
  isLogged: boolean;
}

export interface CycleTrendSummary {
  days: CycleDayTrend[];
  totalLoggedDays: number;
  periodDaysCount: number;
  flowCounts: Record<string, number>;
  moodCounts: Record<string, number>;
  topSymptoms: { symptom: string; count: number }[];
}

export async function getCycleTrend(
  userId: string,
  days = 30
): Promise<CycleTrendSummary> {
  if (!db) {
    return {
      days: [],
      totalLoggedDays: 0,
      periodDaysCount: 0,
      flowCounts: {},
      moodCounts: {},
      topSymptoms: [],
    };
  }

  const numDays = Math.min(Math.max(days, 1), 60);
  const dates: string[] = [];
  const dateObjs: Date[] = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
    dateObjs.push(d);
  }

  const entries = await getRecentCycleEntries(userId, numDays * 2);
  const byDate: Record<string, CycleEntry> = {};
  entries.forEach(e => {
    byDate[e.date] = e;
  });

  const flowCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};
  const symptomFrequency: Record<string, number> = {};

  const dayTrends: CycleDayTrend[] = dates.map((date, idx) => {
    const entry = byDate[date];
    const dObj = dateObjs[idx];
    const dayLabel = dObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    if (entry) {
      if (entry.flow && entry.flow !== 'None') {
        flowCounts[entry.flow] = (flowCounts[entry.flow] || 0) + 1;
      }
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
      entry.symptoms?.forEach(sym => {
        symptomFrequency[sym] = (symptomFrequency[sym] || 0) + 1;
      });
    }

    const hasFlow = entry?.flow && entry.flow !== 'None';
    const isPeriodDay = Boolean(entry?.isPeriodStart || (hasFlow && entry?.flow !== 'Spotting'));

    return {
      date,
      dayLabel,
      flow: entry?.flow,
      mood: entry?.mood,
      energy: entry?.energy,
      symptomCount: entry?.symptoms?.length ?? 0,
      isPeriodDay,
      isLogged: Boolean(entry),
    };
  });

  const totalLoggedDays = dayTrends.filter(d => d.isLogged).length;
  const periodDaysCount = dayTrends.filter(d => d.isPeriodDay).length;

  const topSymptoms = Object.entries(symptomFrequency)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    days: dayTrends,
    totalLoggedDays,
    periodDaysCount,
    flowCounts,
    moodCounts,
    topSymptoms,
  };
}

/** Generic trend function matching standard prompt interface */
export async function getTrend(userId: string, metric = 'cycle', days = 30) {
  return getCycleTrend(userId, days);
}
