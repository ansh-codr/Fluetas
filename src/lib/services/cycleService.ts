/**
 * Cycle Service (FLUETAS HER)
 * Clinical menstrual cycle & symptom telemetry
 * Stored under:
 *   - /cycleLogs/{userId}/entries/{date}
 *   - /users/{userId}/cycleSettings/profile
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTimelineEvent } from './timelineService';
import {
  DailyCycleLog,
  CycleSettings,
  BleedingFlow,
  MoodType,
  EnergyType,
  CervicalMucus,
  LHTestResult,
} from '../cycle/types';

// Backwards-compatible exports
export type FlowLevel = 'Light' | 'Medium' | 'Heavy' | 'Spotting' | 'None';
export type MoodLevel = 'Great' | 'Good' | 'Neutral' | 'Low' | 'Anxious' | 'Irritable';
export type EnergyLevel = 'High' | 'Medium' | 'Low' | 'Exhausted';

export interface CycleEntry {
  id?: string;
  userId: string;
  date: string;
  isPeriodStart?: boolean;
  isPeriodEnd?: boolean;
  flow?: FlowLevel;
  mood?: MoodLevel;
  energy?: EnergyLevel;
  symptoms?: string[];
  notes?: string;
  timestamp: any;
}

/**
 * Saves or updates cycle configuration settings (setup flow).
 */
export async function saveCycleSettings(
  userId: string,
  settings: Partial<CycleSettings>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  if (!userId) throw new Error('User ID required');

  const ref = doc(db, 'users', userId, 'cycleSettings', 'profile');
  await setDoc(
    ref,
    {
      ...settings,
      configured: true,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

/**
 * Retrieves cycle settings profile.
 */
export async function getCycleSettings(userId: string): Promise<CycleSettings | null> {
  if (!db || !userId) return null;
  try {
    const ref = doc(db, 'users', userId, 'cycleSettings', 'profile');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as CycleSettings;
    }
  } catch (err) {
    console.warn('[CycleService] getCycleSettings failed:', err);
  }
  return null;
}

/**
 * Upserts a DailyCycleLog document using its date (YYYY-MM-DD) as the document key.
 */
export async function saveDailyCycleLog(
  userId: string,
  logData: {
    date: string;
    flow?: BleedingFlow;
    symptoms?: string[];
    mood?: MoodType;
    energy?: EnergyType;
    cervicalMucus?: CervicalMucus;
    bbt?: number;
    lhTest?: LHTestResult;
    notes?: string;
  }
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  if (!userId || !logData.date) throw new Error('User ID and date are required');

  const ref = doc(db, 'cycleLogs', userId, 'entries', logData.date);

  const payload: DailyCycleLog = {
    userId,
    date: logData.date,
    flow: logData.flow || 'none',
    symptoms: logData.symptoms || [],
    mood: logData.mood,
    energy: logData.energy,
    cervicalMucus: logData.cervicalMucus,
    bbt: logData.bbt,
    lhTest: logData.lhTest,
    notes: logData.notes?.trim() || '',
    source: 'MANUAL',
    updatedAt: Timestamp.now(),
  };

  await setDoc(ref, payload, { merge: true });

  // Add timeline entry if bleeding or key symptoms recorded
  if (logData.flow && logData.flow !== 'none') {
    await addTimelineEvent(userId, {
      type: 'cycle_logged',
      title: 'Period Logged',
      description: `${logData.date} · Flow: ${logData.flow.toUpperCase()}`,
      category: 'Her',
      badge: 'Logged',
      metadata: { date: logData.date, flow: logData.flow },
    });
  }
}

/**
 * Fetches a single day cycle log.
 */
export async function getDailyCycleLog(
  userId: string,
  date: string
): Promise<DailyCycleLog | null> {
  if (!db || !userId || !date) return null;
  try {
    const ref = doc(db, 'cycleLogs', userId, 'entries', date);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as DailyCycleLog;
    }
  } catch (err) {
    console.warn('[CycleService] getDailyCycleLog failed:', err);
  }
  return null;
}

/**
 * Fetches all cycle logs for the user.
 */
export async function getAllCycleLogs(userId: string): Promise<DailyCycleLog[]> {
  if (!db || !userId) return [];
  try {
    const q = query(
      collection(db, 'cycleLogs', userId, 'entries'),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyCycleLog));
  } catch (err) {
    // If order by date throws indexing warning, fallback to direct get
    try {
      const snap = await getDocs(collection(db, 'cycleLogs', userId, 'entries'));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyCycleLog));
      return items.sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }
}

/**
 * Deletes a daily cycle log document.
 */
export async function deleteDailyCycleLog(userId: string, date: string): Promise<void> {
  if (!db || !userId || !date) return;
  const ref = doc(db, 'cycleLogs', userId, 'entries', date);
  await deleteDoc(ref);
}

// ── BACKWARDS COMPATIBILITY WRAPPERS ───────────────────────────────────────

export async function logCycleEntry(
  userId: string,
  data: Omit<CycleEntry, 'id' | 'userId' | 'timestamp'>
): Promise<string> {
  let mappedFlow: BleedingFlow = 'none';
  if (data.flow === 'Light') mappedFlow = 'light';
  else if (data.flow === 'Medium') mappedFlow = 'moderate';
  else if (data.flow === 'Heavy') mappedFlow = 'heavy';
  else if (data.flow === 'Spotting') mappedFlow = 'spotting';

  let mappedMood: MoodType | undefined = undefined;
  if (data.mood === 'Great' || data.mood === 'Good') mappedMood = 'good';
  else if (data.mood === 'Neutral') mappedMood = 'neutral';
  else if (data.mood === 'Low') mappedMood = 'low';
  else if (data.mood === 'Anxious') mappedMood = 'anxious';
  else if (data.mood === 'Irritable') mappedMood = 'irritable';

  await saveDailyCycleLog(userId, {
    date: data.date,
    flow: mappedFlow,
    symptoms: data.symptoms,
    mood: mappedMood,
    notes: data.notes,
  });

  return data.date;
}

export async function getRecentCycleEntries(
  userId: string,
  count = 30
): Promise<CycleEntry[]> {
  const logs = await getAllCycleLogs(userId);
  return logs.slice(0, count).map(l => ({
    id: l.id,
    userId: l.userId,
    date: l.date,
    flow: (l.flow ? (l.flow.charAt(0).toUpperCase() + l.flow.slice(1)) : 'None') as FlowLevel,
    symptoms: l.symptoms,
    notes: l.notes,
    timestamp: l.updatedAt || Timestamp.now(),
  }));
}

export async function deleteCycleEntry(userId: string, entryId: string): Promise<void> {
  await deleteDailyCycleLog(userId, entryId);
}
