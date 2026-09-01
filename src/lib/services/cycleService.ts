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
