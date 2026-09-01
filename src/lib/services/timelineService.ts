/**
 * Timeline Service
 * Writes events to /users/{uid}/healthTimeline
 * Every meaningful user action should produce a timeline entry.
 */

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type TimelineEventType =
  | 'profile_created'
  | 'hydration_logged'
  | 'sleep_logged'
  | 'workout_completed'
  | 'meal_logged'
  | 'cycle_logged'
  | 'symptom_logged'
  | 'consultation_booked'
  | 'consultation_completed'
  | 'report_uploaded'
  | 'report_reviewed'
  | 'recommendation_added'
  | 'followup_scheduled'
  | 'consent_revoked'
  | 'test_requested';

export interface TimelineEvent {
  type: TimelineEventType;
  title: string;
  description: string;
  category: string;
  badge?: string;
  relatedId?: string;
  metadata?: Record<string, unknown>;
}

export async function addTimelineEvent(
  userId: string,
  event: TimelineEvent
): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, 'users', userId, 'healthTimeline'), {
      ...event,
      timestamp: Timestamp.now(),
    });
  } catch (err) {
    // Timeline writes are non-critical — log but don't throw
    console.warn('[Timeline] Failed to write event:', err);
  }
}

export async function getRecentTimeline(userId: string, count = 20) {
  if (!db) return [];
  const q = query(
    collection(db, 'users', userId, 'healthTimeline'),
    orderBy('timestamp', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
