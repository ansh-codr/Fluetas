/**
 * Workout Service
 * Persists to /workoutLogs/{userId}/entries
 */

import {
  addDoc,
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTimelineEvent } from './timelineService';
import { createNotification } from './notificationService';

export interface ExerciseSet {
  set: number;
  reps: string;
  weight: string;
  done: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetMuscle: string;
  notes?: string;
  sets: ExerciseSet[];
}

export type WorkoutStatus = 'active' | 'completed' | 'abandoned';

export interface WorkoutSession {
  id?: string;
  userId: string;
  workoutName: string;
  workoutType: string;
  exercises: WorkoutExercise[];
  startTime: Timestamp;
  endTime?: Timestamp;
  durationMins?: number;
  status: WorkoutStatus;
  date: string; // YYYY-MM-DD
  completedSets?: number;
  totalSets?: number;
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export async function startWorkoutSession(
  userId: string,
  workoutName: string,
  workoutType: string,
  exercises: WorkoutExercise[]
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const session: Omit<WorkoutSession, 'id'> = {
    userId,
    workoutName,
    workoutType,
    exercises,
    startTime: Timestamp.now(),
    status: 'active',
    date: todayDateStr(),
    completedSets: 0,
    totalSets,
  };

  const ref = await addDoc(collection(db, 'workoutLogs', userId, 'entries'), session);
  return ref.id;
}

export async function completeWorkoutSession(
  userId: string,
  sessionId: string,
  exercises: WorkoutExercise[]
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const endTime = Timestamp.now();
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.done).length,
    0
  );
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  await updateDoc(doc(db, 'workoutLogs', userId, 'entries', sessionId), {
    exercises,
    endTime,
    status: 'completed' as WorkoutStatus,
    completedSets,
    totalSets,
  });

  // Build workout name from the session — we need to fetch it to get the name
  const snap = await getDocs(query(
    collection(db, 'workoutLogs', userId, 'entries'),
    where('__name__', '==', sessionId),
    limit(1)
  ));

  const workoutName = snap.empty ? 'Workout' : (snap.docs[0].data() as WorkoutSession).workoutName;

  await addTimelineEvent(userId, {
    type: 'workout_completed',
    title: 'Workout Completed',
    description: `${workoutName} · ${completedSets}/${totalSets} sets done`,
    category: 'Training',
    badge: 'Completed',
    relatedId: sessionId,
    metadata: { workoutName, completedSets, totalSets },
  });

  await createNotification(userId, {
    type: 'workout_completed',
    title: 'Workout Complete! 💪',
    message: `${workoutName} — ${completedSets} sets logged.`,
    relatedResourceType: 'workoutSession',
    relatedResourceId: sessionId,
  });
}

export async function getTodayWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
  if (!db) return [];
  try {
    const today = todayDateStr();
    const q = query(
      collection(db, 'workoutLogs', userId, 'entries'),
      where('date', '==', today)
    );
    const snap = await getDocs(q);
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutSession));
    return entries.sort((a, b) => (b.startTime?.seconds || 0) - (a.startTime?.seconds || 0));
  } catch (err) {
    console.warn('[WorkoutService] getTodayWorkoutSessions failed:', err);
    return [];
  }
}

export async function getRecentWorkoutSessions(
  userId: string,
  count = 10
): Promise<WorkoutSession[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'workoutLogs', userId, 'entries'),
      limit(count * 2)
    );
    const snap = await getDocs(q);
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutSession));
    return entries
      .sort((a, b) => (b.startTime?.seconds || 0) - (a.startTime?.seconds || 0))
      .slice(0, count);
  } catch (err) {
    console.warn('[WorkoutService] getRecentWorkoutSessions failed:', err);
    return [];
  }
}

export async function getWeeklyWorkoutCount(userId: string): Promise<number> {
  if (!db) return 0;
  try {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    const q = query(
      collection(db, 'workoutLogs', userId, 'entries'),
      where('date', 'in', dates)
    );
    const snap = await getDocs(q);
    return snap.docs.filter(d => d.data().status === 'completed').length;
  } catch (err) {
    console.warn('[WorkoutService] getWeeklyWorkoutCount failed:', err);
    return 0;
  }
}

export interface WorkoutDayTrend {
  date: string;
  dayLabel: string;
  sessionCount: number;
  totalSets: number;
  completedSets: number;
  estimatedVolumeKg: number;
  isLogged: boolean;
}

export interface WorkoutTrendSummary {
  days: WorkoutDayTrend[];
  totalSessions: number;
  totalCompletedSets: number;
  totalVolumeKg: number;
  sessionDelta: number;
  completionRate: number;
}

export async function getWorkoutTrend(
  userId: string,
  days = 7
): Promise<WorkoutTrendSummary> {
  if (!db) {
    return {
      days: [],
      totalSessions: 0,
      totalCompletedSets: 0,
      totalVolumeKg: 0,
      sessionDelta: 0,
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

  const q = query(
    collection(db, 'workoutLogs', userId, 'entries'),
    where('date', 'in', dates.slice(0, 30))
  );
  const snap = await getDocs(q);

  const dayMap: Record<string, { sessionCount: number; totalSets: number; completedSets: number; volumeKg: number }> = {};
  snap.docs.forEach(d => {
    const session = d.data() as WorkoutSession;
    if (!dayMap[session.date]) {
      dayMap[session.date] = { sessionCount: 0, totalSets: 0, completedSets: 0, volumeKg: 0 };
    }
    dayMap[session.date].sessionCount += 1;
    dayMap[session.date].totalSets += session.totalSets ?? 0;
    dayMap[session.date].completedSets += session.completedSets ?? 0;

    // Estimate volume (weight * reps for done sets)
    if (session.exercises) {
      session.exercises.forEach(ex => {
        ex.sets?.forEach(set => {
          if (set.done) {
            const w = parseFloat(set.weight) || 0;
            const r = parseFloat(set.reps) || 0;
            dayMap[session.date].volumeKg += Math.round(w * r);
          }
        });
      });
    }
  });

  const dayTrends: WorkoutDayTrend[] = dates.map((date, idx) => {
    const d = dayMap[date];
    const dObj = dateObjs[idx];
    const dayLabel = dObj.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date,
      dayLabel,
      sessionCount: d?.sessionCount ?? 0,
      totalSets: d?.totalSets ?? 0,
      completedSets: d?.completedSets ?? 0,
      estimatedVolumeKg: d?.volumeKg ?? 0,
      isLogged: Boolean(d && d.sessionCount > 0),
    };
  });

  const totalSessions = dayTrends.reduce((sum, d) => sum + d.sessionCount, 0);
  const totalCompletedSets = dayTrends.reduce((sum, d) => sum + d.completedSets, 0);
  const totalPlannedSets = dayTrends.reduce((sum, d) => sum + d.totalSets, 0);
  const totalVolumeKg = dayTrends.reduce((sum, d) => sum + d.estimatedVolumeKg, 0);

  const completionRate = totalPlannedSets > 0
    ? Math.round((totalCompletedSets / totalPlannedSets) * 100)
    : 100;

  // Delta: compare recent half vs prior half
  const half = Math.floor(numDays / 2);
  let sessionDelta = 0;
  if (half > 0) {
    const recentSessions = dayTrends.slice(half).reduce((sum, d) => sum + d.sessionCount, 0);
    const priorSessions = dayTrends.slice(0, half).reduce((sum, d) => sum + d.sessionCount, 0);
    sessionDelta = recentSessions - priorSessions;
  }

  return {
    days: dayTrends,
    totalSessions,
    totalCompletedSets,
    totalVolumeKg,
    sessionDelta,
    completionRate,
  };
}

/** Generic trend function matching standard prompt interface */
export async function getTrend(userId: string, metric = 'sessions', days = 7) {
  return getWorkoutTrend(userId, days);
}
