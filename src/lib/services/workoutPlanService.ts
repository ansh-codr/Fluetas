/**
 * Production Workout Plan & Versioned Persistence Service
 * Backed by Firestore: /workoutPlans/{userId}/plans/{planId}
 * Version snapshots: /workoutPlans/{userId}/plans/{planId}/versions/{versionId}
 * Pure deterministic rule integration via planEngine.ts.
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getExerciseProvider } from '@/lib/exercises/provider';
import { Exercise } from '@/lib/exercises/types';
import { HealthProfile, isWorkoutPlanReady } from './userService';
import { ExerciseSet, WorkoutExercise, WorkoutSession } from './workoutService';
import { logAuditEvent } from './auditService';
import { createNotification } from './notificationService';
import { validateDoctorAccess } from './consentService';
import {
  Goal,
  FitnessLevel,
  SplitType,
  PlanProfile,
  DayTemplate,
  GOAL_RULES,
  classifyUser,
  resolveSplitType,
  buildDayTemplates,
  filterExercisesForDay,
  PlanGenerationError,
  PlanClassificationError,
} from './planEngine';

export interface PlanExerciseItem {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: string;
  targetSets: number;
  targetReps: string; // e.g. "8-12"
  restSeconds: number;
  orderIndex: number;
  equipment: string;
  difficulty: string;
  suggestedNextWeight?: number;
  suggestedNextReps?: string;
  progressionNote?: string;
}

export interface PlanDay {
  dayIndex: number;
  dayLabel: string;
  focus: string;
  muscleTargets: string[];
  exercises: PlanExerciseItem[];
}

export interface WorkoutPlan {
  planId: string;
  id?: string; // alias
  userId: string;
  goal: Goal;
  fitnessLevel: FitnessLevel;
  daysPerWeek: number;
  equipmentAccess: string;
  splitType: SplitType;
  status: 'active' | 'archived';
  title: string;
  version: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  days: PlanDay[];
  personalizationInputs?: {
    goal: string;
    fitnessLevel: string;
    experienceLevel?: string;
    daysPerWeek: number;
    sessionDuration?: number;
    equipment: string;
    workoutLocation?: string;
    restrictions: string[];
  };
}

export interface PlanVersionSnapshot {
  versionId: string;
  planId: string;
  userId: string;
  version: number;
  archivedAt: Timestamp;
  editedBy: string;
  planSnapshot: WorkoutPlan;
}

/**
 * Generates a complete, deterministic, real-catalog WorkoutPlan for a user profile.
 * Zero AI/LLM calls. Hard-fails with PlanGenerationError if any day cannot be populated.
 */
export async function generateWorkoutPlan(
  userId: string,
  profile: HealthProfile
): Promise<WorkoutPlan> {
  if (!db) throw new Error('Firebase database not configured');
  if (!userId) throw new Error('User ID is required to generate workout plan');

  // 0. Explicit Profile Readiness Check (Never generate from missing data)
  const readiness = isWorkoutPlanReady(null, profile);
  if (!readiness.ready) {
    throw new PlanClassificationError(
      `Cannot generate workout plan. Incomplete customer profile: Missing [${readiness.missingFields.join(', ')}].`,
      'profile',
      readiness.missingFields
    );
  }

  // 1. Pure classification
  const planProfile: PlanProfile = classifyUser(profile);

  // 2. Resolve split & day templates
  const splitType = resolveSplitType(planProfile.daysPerWeek, planProfile.fitnessLevel);
  const dayTemplates: DayTemplate[] = buildDayTemplates(
    splitType,
    planProfile.daysPerWeek,
    planProfile.goal
  );

  // 3. Query all available catalog exercises
  const provider = getExerciseProvider();
  const catalogResult = await provider.getExercises({ limit: 200, includeVideos: false });
  const catalog: Exercise[] = catalogResult.exercises;

  if (!catalog || catalog.length === 0) {
    throw new Error('Exercise catalog is empty. Cannot generate workout plan.');
  }

  // 4. Populate exercises for each day template
  const generatedDays: PlanDay[] = [];

  for (const template of dayTemplates) {
    const validExercises = filterExercisesForDay(catalog, template, planProfile);

    if (validExercises.length === 0) {
      throw new PlanGenerationError(
        template.dayIndex,
        template.dayLabel,
        template.muscleTargets,
        `Zero exercises matched constraints (Equipment: "${planProfile.equipmentAccess}", Difficulty: "${planProfile.levelScale.maxDifficulty}", Injuries: [${planProfile.injuryTags.join(', ')}]).`
      );
    }

    // Select 3 to 5 balanced exercises for the day
    const targetExerciseCount = Math.min(validExercises.length, planProfile.goal === 'strength' ? 4 : 5);
    const selectedCatalogExercises = validExercises.slice(0, targetExerciseCount);

    const baseSets = planProfile.goalRule.baseSetsPerExercise;
    const computedSets = Math.max(2, Math.round(baseSets * planProfile.levelScale.setsMultiplier));
    const [minReps, maxReps] = planProfile.goalRule.repRange;
    const repRangeLabel = minReps === maxReps ? `${minReps}` : `${minReps}-${maxReps}`;

    const dayExercises: PlanExerciseItem[] = selectedCatalogExercises.map((ex, orderIdx) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscles[0] || ex.muscleGroups[0] || 'Target Muscle',
      targetSets: computedSets,
      targetReps: repRangeLabel,
      restSeconds: planProfile.goalRule.restSeconds,
      orderIndex: orderIdx,
      equipment: ex.equipment,
      difficulty: ex.difficulty as string,
    }));

    generatedDays.push({
      dayIndex: template.dayIndex,
      dayLabel: template.dayLabel,
      focus: template.focus,
      muscleTargets: template.muscleTargets,
      exercises: dayExercises,
    });
  }

  // 5. Build WorkoutPlan document with explainable personalization inputs
  const now = Timestamp.now();
  const planRef = doc(collection(db, 'workoutPlans', userId, 'plans'));
  const planId = planRef.id;

  const titleGoalMap: Record<Goal, string> = {
    lose_weight: 'Metabolic Conditioning & Fat Loss',
    build_muscle: 'Hypertrophy & Muscle Architecture',
    strength: 'Absolute Strength & Power',
    endurance: 'Cardiovascular & Muscular Stamina',
    general_fitness: 'Total Wellness & Functional Health',
    mobility: 'Joint Mobility & Postural Restoration',
  };

  const planTitle = `${titleGoalMap[planProfile.goal]} (${planProfile.daysPerWeek}-Day ${splitType.replace(/_/g, ' ').toUpperCase()})`;

  const newPlan: WorkoutPlan = {
    planId,
    id: planId,
    userId,
    goal: planProfile.goal,
    fitnessLevel: planProfile.fitnessLevel,
    daysPerWeek: planProfile.daysPerWeek,
    equipmentAccess: planProfile.equipmentAccess,
    splitType,
    status: 'active',
    title: planTitle,
    version: 1,
    createdAt: now,
    updatedAt: now,
    days: generatedDays,
    personalizationInputs: {
      goal: planProfile.goal,
      fitnessLevel: planProfile.fitnessLevel,
      experienceLevel: String(profile.experienceLevel || planProfile.fitnessLevel),
      daysPerWeek: planProfile.daysPerWeek,
      sessionDuration: profile.preferredSessionDuration || 45,
      equipment: planProfile.equipmentAccess,
      workoutLocation: String(profile.workoutLocation || 'commercial_gym'),
      restrictions: planProfile.injuryTags,
    },
  };

  // 6. Archive previous active plans before setting new active plan
  const existingPlans = await getUserWorkoutPlans(userId);
  for (const p of existingPlans) {
    if (p.planId && p.status === 'active') {
      await updateDoc(doc(db, 'workoutPlans', userId, 'plans', p.planId), {
        status: 'archived',
        updatedAt: now,
      });
    }
  }

  // 7. Write new plan
  await setDoc(planRef, newPlan);

  // 8. Audit log creation
  await logAuditEvent({
    actorId: userId,
    actorRole: 'customer',
    action: 'workout_plan_generated',
    resourceType: 'workoutPlan',
    resourceId: planId,
    customerId: userId,
    details: `Generated active ${planProfile.goal} plan with ${planProfile.daysPerWeek} training days.`,
    result: 'SUCCESS',
  });

  return newPlan;
}

/**
 * Fetches all workout plans for a user.
 */
export async function getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
  if (!db || !userId) return [];
  const q = query(
    collection(db, 'workoutPlans', userId, 'plans'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      planId: d.id,
      id: d.id,
      ...data,
    } as WorkoutPlan;
  });
}

/**
 * Fetches the currently active workout plan for a user.
 */
export async function getActiveWorkoutPlan(userId: string): Promise<WorkoutPlan | null> {
  if (!db || !userId) return null;
  const plans = await getUserWorkoutPlans(userId);
  return plans.find(p => p.status === 'active') ?? plans[0] ?? null;
}

/**
 * Edits an existing workout plan with full immutable pre-edit version archival.
 * Never destroys plan history.
 */
export async function editWorkoutPlan(
  userId: string,
  planId: string,
  changes: Partial<Omit<WorkoutPlan, 'planId' | 'id' | 'userId' | 'createdAt' | 'version'>>,
  editedBy: string
): Promise<WorkoutPlan> {
  if (!db) throw new Error('Firebase not configured');

  // 1. Read current plan
  const planDocRef = doc(db, 'workoutPlans', userId, 'plans', planId);
  const planSnap = await getDoc(planDocRef);

  if (!planSnap.exists()) {
    throw new Error(`Workout plan not found for id: ${planId}`);
  }

  const currentPlan = { planId: planSnap.id, id: planSnap.id, ...planSnap.data() } as WorkoutPlan;

  // 2. Validate authorization if edited by a doctor/trainer
  const isOwner = editedBy === userId;
  if (!isOwner) {
    const authResult = await validateDoctorAccess(editedBy, userId, 'workout_data');
    if (!authResult.authorized) {
      throw new Error(`Unauthorized: Doctor does not have active consent to modify patient plan. (${authResult.reason})`);
    }
  }

  const now = Timestamp.now();
  const nextVersion = (currentPlan.version || 1) + 1;

  // 3. Write immutable pre-edit snapshot to versions subcollection
  const versionId = `v_${currentPlan.version || 1}_${Date.now()}`;
  const versionRef = doc(db, 'workoutPlans', userId, 'plans', planId, 'versions', versionId);

  const snapshot: PlanVersionSnapshot = {
    versionId,
    planId,
    userId,
    version: currentPlan.version || 1,
    archivedAt: now,
    editedBy,
    planSnapshot: currentPlan,
  };

  await setDoc(versionRef, snapshot);

  // 4. Apply changes to active plan document
  const updatedPlan: WorkoutPlan = {
    ...currentPlan,
    ...changes,
    planId,
    id: planId,
    userId,
    version: nextVersion,
    updatedAt: now,
  };

  await setDoc(planDocRef, updatedPlan, { merge: true });

  // 5. Audit log & notification
  await logAuditEvent({
    actorId: editedBy,
    actorRole: isOwner ? 'customer' : 'doctor',
    action: 'workout_plan_edited',
    resourceType: 'workoutPlan',
    resourceId: planId,
    customerId: userId,
    details: `Updated plan from v${currentPlan.version || 1} to v${nextVersion}. Edited by ${isOwner ? 'owner' : 'trainer/doctor'}.`,
    result: 'SUCCESS',
  });

  if (!isOwner) {
    await createNotification(userId, {
      type: 'trainer_updated_your_plan',
      title: 'Workout Plan Updated by Specialist',
      message: `Your coach updated your training plan: ${updatedPlan.title} (v${nextVersion}).`,
      relatedResourceType: 'workoutPlan',
      relatedResourceId: planId,
    });
  }

  return updatedPlan;
}

/**
 * Sets a specified plan as the active one.
 */
export async function setActiveWorkoutPlan(userId: string, planId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const plans = await getUserWorkoutPlans(userId);
  const now = Timestamp.now();

  for (const p of plans) {
    if (p.planId) {
      await updateDoc(doc(db, 'workoutPlans', userId, 'plans', p.planId), {
        status: p.planId === planId ? 'active' : 'archived',
        updatedAt: now,
      });
    }
  }
}

/**
 * Determines today's training day by completed session count.
 * Rotating by completed sessions prevents skipped calendar days from desyncing the routine.
 */
export function getTodaysWorkoutDay(plan: WorkoutPlan, completedSessionsCount: number): PlanDay {
  if (!plan.days || plan.days.length === 0) {
    throw new Error('Plan has no training days.');
  }
  const dayIndex = completedSessionsCount % plan.days.length;
  return plan.days[dayIndex] || plan.days[0];
}

/**
 * Deterministic Progressive Overload Evaluation
 * Analyzes session history per exercise:
 * - All sets hit target: suggest +2.5-5% weight (or +1 rep if bodyweight).
 * - Any set failed: maintain current weight.
 * - Two consecutive failures: suggest reducing target reps toward bottom of rep range.
 */
export function evaluateExerciseProgression(
  exerciseId: string,
  exerciseName: string,
  goal: Goal,
  previousSessions: WorkoutSession[]
): {
  suggestedWeight?: number;
  suggestedReps?: string;
  reason: string;
  status: 'progress' | 'maintain' | 'deload_reps' | 'baseline';
} {
  const goalRule = GOAL_RULES[goal] || GOAL_RULES.general_fitness;
  const [minRep, maxRep] = goalRule.repRange;

  // Filter sessions containing this exercise, ordered newest to oldest
  const matchingSessions = previousSessions.filter(s =>
    s.exercises?.some(e => e.id === exerciseId || e.name.toLowerCase() === exerciseName.toLowerCase())
  );

  if (matchingSessions.length === 0) {
    return {
      reason: 'First session for this exercise. Start with a baseline weight.',
      status: 'baseline',
    };
  }

  // Get most recent session data
  const latestSession = matchingSessions[0];
  const latestEx = latestSession.exercises.find(e => e.id === exerciseId || e.name.toLowerCase() === exerciseName.toLowerCase());
  const sets = latestEx?.sets || [];

  if (sets.length === 0) {
    return { reason: 'No set data found in previous session.', status: 'maintain' };
  }

  const weights = sets.map(s => parseFloat(s.weight) || 0).filter(w => w > 0);
  const currentWeight = weights.length > 0 ? Math.max(...weights) : 0;
  const allSetsCompleted = sets.every(s => s.done);

  // Check second most recent session for consecutive failure detection
  let priorSessionFailed = false;
  if (matchingSessions.length >= 2) {
    const priorSession = matchingSessions[1];
    const priorEx = priorSession.exercises.find(e => e.id === exerciseId || e.name.toLowerCase() === exerciseName.toLowerCase());
    if (priorEx?.sets && priorEx.sets.length > 0) {
      priorSessionFailed = !priorEx.sets.every(s => s.done);
    }
  }

  if (allSetsCompleted) {
    if (currentWeight === 0) {
      // Bodyweight exercise progression
      return {
        suggestedReps: `${minRep + 1}-${maxRep + 1}`,
        reason: `All sets completed! Progress by +1 repetition per set.`,
        status: 'progress',
      };
    }
    // Weighted exercise progression: +2.5kg to +5kg (approx 2.5-5%)
    const increment = currentWeight >= 60 ? 5.0 : 2.5;
    const nextWeight = Math.round((currentWeight + increment) * 10) / 10;
    return {
      suggestedWeight: nextWeight,
      reason: `All ${sets.length} sets completed at ${currentWeight}kg. Progress by +${increment}kg next session.`,
      status: 'progress',
    };
  }

  // Failed to hit all sets in current session
  if (priorSessionFailed) {
    // Two consecutive failures -> suggest reducing target reps
    const reducedReps = Math.max(minRep, maxRep - 2);
    return {
      suggestedWeight: currentWeight,
      suggestedReps: `${minRep}-${reducedReps}`,
      reason: `Two consecutive sessions missed target reps. Maintain ${currentWeight}kg and reduce target reps to ${minRep}-${reducedReps} to consolidate form.`,
      status: 'deload_reps',
    };
  }

  // Single failure -> maintain weight
  const doneCount = sets.filter(s => s.done).length;
  return {
    suggestedWeight: currentWeight,
    reason: `${doneCount}/${sets.length} sets completed last session. Maintain ${currentWeight}kg and repeat to achieve full set completion.`,
    status: 'maintain',
  };
}

/**
 * Builds executable WorkoutExercise objects for startWorkoutSession() from a PlanDay
 */
export function buildSessionExercisesFromPlanDay(
  planDay: PlanDay,
  goal: Goal = 'build_muscle',
  previousSessions: WorkoutSession[] = []
): { exercises: WorkoutExercise[]; suggestions: Record<string, string> } {
  const suggestions: Record<string, string> = {};

  const exercises: WorkoutExercise[] = planDay.exercises.map((item, idx) => {
    const progression = evaluateExerciseProgression(
      item.exerciseId,
      item.exerciseName,
      goal,
      previousSessions
    );

    if (progression.reason) {
      suggestions[item.exerciseId] = progression.reason;
    }

    const assignedWeight = progression.suggestedWeight !== undefined
      ? progression.suggestedWeight.toString()
      : (item.suggestedNextWeight?.toString() || '20');

    const assignedReps = progression.suggestedReps || item.suggestedNextReps || item.targetReps;

    const sets: ExerciseSet[] = Array.from({ length: item.targetSets }, (_, sIdx) => ({
      set: sIdx + 1,
      reps: assignedReps.includes('-') ? assignedReps.split('-')[0] : assignedReps,
      weight: assignedWeight,
      done: false,
    }));

    return {
      id: item.exerciseId || `ex-${idx}`,
      name: item.exerciseName,
      targetMuscle: item.targetMuscle,
      notes: progression.reason,
      sets,
    };
  });

  return { exercises, suggestions };
}
