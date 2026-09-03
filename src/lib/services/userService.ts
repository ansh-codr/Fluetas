/**
 * User Service
 * CRUD for /users/{uid} and /users/{uid}/healthProfile/main
 */

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  dob?: string;
  gender?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  bloodGroup?: string | null;
  role: 'customer' | 'doctor' | 'admin';
  premiumMember: boolean;
  onboardingComplete: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type EquipmentAccess = 'none' | 'basic' | 'full_gym';
export type InjuryTag = 'knee' | 'shoulder' | 'back' | 'wrist' | 'ankle' | 'neck' | 'elbow' | 'hip';

export interface HealthProfile {
  primaryGoal?: string;
  fitnessLevel?: string;
  activityLevel?: string;
  dietaryPreference?: string;
  sleepTargetHrs?: number;
  hydrationTargetL?: number;
  equipmentAccess?: EquipmentAccess;
  daysPerWeek?: number;
  injuryTags?: (InjuryTag | string)[];
  injuryNotes?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  previousSurgeries?: { procedure: string; year: string; hospital: string }[];
  previousInjuries?: { injury: string; year: string; status: string }[];
  familyHistory?: Record<string, string>;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

export async function getHealthProfile(userId: string): Promise<HealthProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', userId, 'healthProfile', 'main'));
  if (!snap.exists()) return null;
  return snap.data() as HealthProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'role' | 'createdAt'>>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await setDoc(
    doc(db, 'users', userId),
    { ...updates, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function updateHealthProfile(
  userId: string,
  updates: Partial<HealthProfile>
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await setDoc(
    doc(db, 'users', userId, 'healthProfile', 'main'),
    { ...updates, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Calculate profile completeness (0–100).
 * Checks defined fields across user doc and health profile.
 */
export function calculateProfileCompleteness(
  profile: Partial<UserProfile> | null,
  healthProfile: Partial<HealthProfile> | null
): { pct: number; completed: string[]; remaining: string[] } {
  const fields: { label: string; done: boolean }[] = [
    { label: 'Full name', done: !!profile?.name },
    { label: 'Date of birth', done: !!profile?.dob },
    { label: 'Gender', done: !!profile?.gender },
    { label: 'Height', done: !!profile?.heightCm },
    { label: 'Weight', done: !!profile?.weightKg },
    { label: 'Blood group', done: !!profile?.bloodGroup },
    { label: 'Primary goal', done: !!healthProfile?.primaryGoal },
    { label: 'Fitness level', done: !!healthProfile?.fitnessLevel },
    { label: 'Activity level', done: !!healthProfile?.activityLevel },
    { label: 'Dietary preference', done: !!healthProfile?.dietaryPreference },
    { label: 'Sleep target', done: !!healthProfile?.sleepTargetHrs },
    { label: 'Hydration target', done: !!healthProfile?.hydrationTargetL },
    { label: 'Emergency contact', done: !!healthProfile?.emergencyContact?.name },
    { label: 'Health history', done: !!(healthProfile?.allergies?.length || healthProfile?.chronicConditions?.length) },
  ];

  const completed = fields.filter(f => f.done).map(f => f.label);
  const remaining = fields.filter(f => !f.done).map(f => f.label);
  const pct = Math.round((completed.length / fields.length) * 100);

  return { pct, completed, remaining };
}
