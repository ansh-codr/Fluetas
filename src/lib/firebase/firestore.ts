/**
 * Typed Firestore collection path helpers.
 * All paths match the data model defined in the FLUETAS spec.
 * Add real CRUD helpers per collection as features are built in later phases.
 */

import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { db as _db } from './config';

// db is null when Firebase is not configured (no .env.local)
const db = _db!;

// ─── Top-level user document ──────────────────────────────────────────────
export const userDoc = (userId: string): DocumentReference =>
  doc(db, 'users', userId);

// ─── Sub-collections under /users/{userId} ────────────────────────────────
export const healthProfileDoc = (userId: string): DocumentReference =>
  doc(db, 'users', userId, 'healthProfile', 'main');

export const healthTimelineCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'healthTimeline');

export const consultationsCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'consultations');

export const consultationDoc = (userId: string, consultationId: string): DocumentReference =>
  doc(db, 'users', userId, 'consultations', consultationId);

export const consultationNotesCol = (userId: string, consultationId: string): CollectionReference =>
  collection(db, 'users', userId, 'consultations', consultationId, 'notes');

export const testRequestsCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'testRequests');

export const documentsCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'documents');

export const recommendationsCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'recommendations');

export const followUpsCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'followUps');

export const appointmentsCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'appointments');

export const consentsCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'consents');

export const accessLogsCol = (userId: string): CollectionReference =>
  collection(db, 'users', userId, 'accessLogs');

// ─── Daily tracking (top-level, keyed by userId) ─────────────────────────
export const workoutLogsCol = (userId: string): CollectionReference =>
  collection(db, 'workoutLogs', userId, 'entries');

export const nutritionLogsCol = (userId: string): CollectionReference =>
  collection(db, 'nutritionLogs', userId, 'entries');

export const hydrationLogsCol = (userId: string): CollectionReference =>
  collection(db, 'hydrationLogs', userId, 'entries');

export const sleepLogsCol = (userId: string): CollectionReference =>
  collection(db, 'sleepLogs', userId, 'entries');

export const cycleLogsCol = (userId: string): CollectionReference =>
  collection(db, 'cycleLogs', userId, 'entries');

export const symptomLogsCol = (userId: string): CollectionReference =>
  collection(db, 'symptomLogs', userId, 'entries');

// ─── Doctors ─────────────────────────────────────────────────────────────
export const doctorsCol = (): CollectionReference =>
  collection(db, 'doctors');

export const doctorDoc = (doctorId: string): DocumentReference =>
  doc(db, 'doctors', doctorId);

// ─── Notifications ────────────────────────────────────────────────────────
export const notificationsCol = (userId: string): CollectionReference =>
  collection(db, 'notifications', userId, 'items');

// ─── Products ─────────────────────────────────────────────────────────────
export const productsCol = (): CollectionReference =>
  collection(db, 'products');


