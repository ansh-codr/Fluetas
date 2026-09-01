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
  const today = todayDateStr();
  const q = query(
    collection(db, 'workoutLogs', userId, 'entries'),
    where('date', '==', today),
    orderBy('startTime', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutSession));
}

export async function getRecentWorkoutSessions(
  userId: string,
  count = 10
): Promise<WorkoutSession[]> {
  if (!db) return [];
  const q = query(
    collection(db, 'workoutLogs', userId, 'entries'),
    orderBy('startTime', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutSession));
}

export async function getWeeklyWorkoutCount(userId: string): Promise<number> {
  if (!db) return 0;
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  const q = query(
    collection(db, 'workoutLogs', userId, 'entries'),
    where('date', 'in', dates),
    where('status', '==', 'completed')
  );
  const snap = await getDocs(q);
  return snap.size;
}
