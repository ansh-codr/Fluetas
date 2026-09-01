/**
 * Symptom Service
 * Persists to /symptomLogs/{userId}/entries
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

export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';

export const SYMPTOM_CATEGORIES = [
  'Musculoskeletal',
  'Digestive',
  'Energy & Focus',
  'Respiratory',
  'Cardiovascular',
  'Neurological',
  'Skin',
  'Other',
] as const;

export type SymptomCategory = typeof SYMPTOM_CATEGORIES[number];

export interface SymptomEntry {
  id?: string;
  userId: string;
  symptom: string;
  category: SymptomCategory;
  severity: SeverityLevel;
  notes?: string;
  date: string; // YYYY-MM-DD
  timestamp: Timestamp;
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export async function logSymptom(
  userId: string,
  data: {
    symptom: string;
    category: SymptomCategory;
    severity: SeverityLevel;
    notes?: string;
  }
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  if (!data.symptom.trim()) throw new Error('Please describe the symptom.');

  const entry: Omit<SymptomEntry, 'id'> = {
    userId,
    symptom: data.symptom.trim(),
    category: data.category,
    severity: data.severity,
    notes: data.notes?.trim(),
    date: todayDateStr(),
    timestamp: Timestamp.now(),
  };

  const ref = await addDoc(collection(db, 'symptomLogs', userId, 'entries'), entry);

  await addTimelineEvent(userId, {
    type: 'symptom_logged',
    title: 'Symptom Logged',
    description: `${data.symptom} · ${data.severity} · ${data.category}`,
    category: 'Health',
    badge: data.severity,
    metadata: { symptom: data.symptom, severity: data.severity, category: data.category },
  });

  return ref.id;
}

export async function getRecentSymptoms(
  userId: string,
  count = 20
): Promise<SymptomEntry[]> {
  if (!db) return [];
  const q = query(
    collection(db, 'symptomLogs', userId, 'entries'),
    orderBy('timestamp', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SymptomEntry));
}

export async function deleteSymptom(userId: string, entryId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'symptomLogs', userId, 'entries', entryId));
}
