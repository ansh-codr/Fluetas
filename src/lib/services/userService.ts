/**
 * User Service
 * CRUD for /users/{uid} and /users/{uid}/healthProfile/main
 * Deterministic Profile Completeness, Health Engine Gate, and Workout Engine Readiness
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
  role: 'customer' | 'doctor' | 'admin' | 'expert';
  premiumMember: boolean;
  onboardingComplete: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type EquipmentAccess = 'none' | 'basic' | 'full_gym';
export type WorkoutLocation = 'home' | 'commercial_gym' | 'outdoors' | 'hybrid';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'athlete';
export type InjuryTag = 'knee' | 'shoulder' | 'back' | 'wrist' | 'ankle' | 'neck' | 'elbow' | 'hip';

export interface HealthProfile {
  primaryGoal?: string;
  fitnessGoal?: string; // alias for primaryGoal
  fitnessLevel?: string;
  experienceLevel?: ExperienceLevel | string;
  activityLevel?: string;
  daysPerWeek?: number;
  preferredSessionDuration?: number; // e.g. 30, 45, 60, 90 mins
  equipmentAccess?: EquipmentAccess;
  equipment?: EquipmentAccess; // alias
  workoutLocation?: WorkoutLocation | string;
  injuryTags?: (InjuryTag | string)[];
  injuries?: (InjuryTag | string)[]; // alias
  physicalRestrictions?: string[];
  relevantHealthConditions?: string[];
  chronicConditions?: string[];
  dietaryPreference?: string;
  sleepTargetHrs?: number;
  hydrationTargetL?: number;
  injuryNotes?: string;
  allergies?: string[];
  currentMedications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  previousSurgeries?: { procedure: string; year: string; hospital: string }[];
  previousInjuries?: { injury: string; year: string; status: string }[];
  familyHistory?: Record<string, string>;
  onboardingCompletedAt?: unknown;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!db || !userId) return null;
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

export async function getHealthProfile(userId: string): Promise<HealthProfile | null> {
  if (!db || !userId) return null;
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
 * Deterministic Profile Completeness Calculation (0–100%).
 * Evaluates the presence of actual stored fields.
 */
export function calculateProfileCompleteness(
  profile: Partial<UserProfile> | null,
  healthProfile: Partial<HealthProfile> | null
): { pct: number; completed: string[]; remaining: string[] } {
  const fields: { label: string; done: boolean }[] = [
    { label: 'Full name', done: !!profile?.name?.trim() },
    { label: 'Date of birth', done: !!profile?.dob },
    { label: 'Gender', done: !!profile?.gender },
    { label: 'Height', done: typeof profile?.heightCm === 'number' && profile.heightCm > 0 },
    { label: 'Weight', done: typeof profile?.weightKg === 'number' && profile.weightKg > 0 },
    { label: 'Activity level', done: !!healthProfile?.activityLevel },
    { label: 'Fitness goal', done: !!(healthProfile?.primaryGoal || healthProfile?.fitnessGoal) },
    { label: 'Fitness level', done: !!healthProfile?.fitnessLevel },
    { label: 'Experience level', done: !!healthProfile?.experienceLevel },
    { label: 'Workout frequency', done: typeof healthProfile?.daysPerWeek === 'number' && healthProfile.daysPerWeek > 0 },
    { label: 'Session duration', done: typeof healthProfile?.preferredSessionDuration === 'number' && healthProfile.preferredSessionDuration > 0 },
    { label: 'Equipment access', done: !!(healthProfile?.equipmentAccess || healthProfile?.equipment) },
    { label: 'Workout location', done: !!healthProfile?.workoutLocation },
    { label: 'Safety & injury screening', done: Array.isArray(healthProfile?.injuryTags) || Array.isArray(healthProfile?.physicalRestrictions) },
    { label: 'Dietary preference', done: !!healthProfile?.dietaryPreference },
  ];

  const completed = fields.filter(f => f.done).map(f => f.label);
  const remaining = fields.filter(f => !f.done).map(f => f.label);
  const pct = Math.round((completed.length / fields.length) * 100);

  return { pct, completed, remaining };
}

/**
 * Health Engine Gate
 * Requires minimum biometrics and fitness profile.
 */
export function isHealthEngineReady(
  profile: Partial<UserProfile> | null,
  healthProfile: Partial<HealthProfile> | null
): { ready: boolean; missingFields: string[] } {
  const missing: string[] = [];

  if (!profile?.name?.trim()) missing.push('Full Name');
  if (!profile?.dob) missing.push('Date of Birth');
  if (!profile?.gender) missing.push('Gender');
  if (!profile?.heightCm || profile.heightCm <= 0) missing.push('Height');
  if (!profile?.weightKg || profile.weightKg <= 0) missing.push('Weight');
  if (!healthProfile?.activityLevel) missing.push('Activity Level');
  if (!healthProfile?.primaryGoal && !healthProfile?.fitnessGoal) missing.push('Fitness Goal');
  if (!healthProfile?.fitnessLevel) missing.push('Fitness Level');

  return {
    ready: missing.length === 0,
    missingFields: missing,
  };
}

/**
 * Workout Plan Engine Gate
 * Requires complete fitness, scheduling, equipment, and safety screening.
 * Strictly prevents plan generation from missing data.
 */
export function isWorkoutPlanReady(
  profile: Partial<UserProfile> | null,
  healthProfile: Partial<HealthProfile> | null
): {
  ready: boolean;
  status: 'READY' | 'INCOMPLETE_PROFILE';
  missingFields: string[];
} {
  const missing: string[] = [];

  if (!healthProfile?.primaryGoal && !healthProfile?.fitnessGoal) missing.push('Fitness Goal');
  if (!healthProfile?.fitnessLevel) missing.push('Fitness Level');
  if (!healthProfile?.experienceLevel) missing.push('Experience Level');
  if (typeof healthProfile?.daysPerWeek !== 'number' || healthProfile.daysPerWeek < 2) missing.push('Workout Frequency (Days per week)');
  if (typeof healthProfile?.preferredSessionDuration !== 'number' || healthProfile.preferredSessionDuration <= 0) missing.push('Session Duration');
  if (!healthProfile?.equipmentAccess && !healthProfile?.equipment) missing.push('Equipment Access');
  if (!healthProfile?.workoutLocation) missing.push('Workout Location');
  if (!Array.isArray(healthProfile?.injuryTags) && !Array.isArray(healthProfile?.physicalRestrictions)) {
    missing.push('Safety / Injury Screening');
  }

  const ready = missing.length === 0;

  return {
    ready,
    status: ready ? 'READY' : 'INCOMPLETE_PROFILE',
    missingFields: missing,
  };
}
