/**
 * Pure Deterministic Workout Planning Engine
 * 100% pure functions, zero network/side-effects, unit-tested.
 * No AI/LLM, no silent defaults, no swallowed errors.
 */

import { Exercise, ExerciseDifficulty } from '@/lib/exercises/types';
import { HealthProfile, EquipmentAccess } from './userService';

export type Goal =
  | 'lose_weight'
  | 'build_muscle'
  | 'strength'
  | 'endurance'
  | 'general_fitness'
  | 'mobility';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'athlete';

export type SplitType = 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part';

export interface GoalRule {
  repRange: [number, number];
  restSeconds: number;
  cardioMinutes: number;
  exerciseTypeBias: string[];
  baseSetsPerExercise: number;
}

export const GOAL_RULES: Record<Goal, GoalRule> = {
  lose_weight: {
    repRange: [12, 15],
    restSeconds: 45,
    cardioMinutes: 20,
    exerciseTypeBias: ['Compound', 'Strength', 'Circuit'],
    baseSetsPerExercise: 3,
  },
  build_muscle: {
    repRange: [8, 12],
    restSeconds: 75,
    cardioMinutes: 0,
    exerciseTypeBias: ['Hypertrophy', 'Strength', 'Compound'],
    baseSetsPerExercise: 4,
  },
  strength: {
    repRange: [3, 6],
    restSeconds: 150,
    cardioMinutes: 0,
    exerciseTypeBias: ['Strength', 'Compound', 'Power'],
    baseSetsPerExercise: 4,
  },
  endurance: {
    repRange: [15, 20],
    restSeconds: 25,
    cardioMinutes: 25,
    exerciseTypeBias: ['Endurance', 'Bodyweight', 'Conditioning'],
    baseSetsPerExercise: 3,
  },
  general_fitness: {
    repRange: [10, 12],
    restSeconds: 60,
    cardioMinutes: 15,
    exerciseTypeBias: ['Balanced', 'Strength', 'Functional'],
    baseSetsPerExercise: 3,
  },
  mobility: {
    repRange: [8, 10],
    restSeconds: 30,
    cardioMinutes: 0,
    exerciseTypeBias: ['Mobility', 'Flexibility', 'Rehab'],
    baseSetsPerExercise: 3,
  },
};

export const LEVEL_SCALING: Record<FitnessLevel, { setsMultiplier: number; maxDifficulty: ExerciseDifficulty }> = {
  beginner: { setsMultiplier: 0.8, maxDifficulty: 'Beginner' },
  intermediate: { setsMultiplier: 1.0, maxDifficulty: 'Intermediate' },
  advanced: { setsMultiplier: 1.2, maxDifficulty: 'Advanced' },
  athlete: { setsMultiplier: 1.4, maxDifficulty: 'Advanced' },
};

export const INJURY_EXCLUSION_MAP: Record<string, { excludeMuscleGroups: string[]; excludeExerciseTypes: string[] }> = {
  knee: {
    excludeMuscleGroups: ['Quads', 'Hamstrings', 'Calves', 'Knees'],
    excludeExerciseTypes: ['Heavy Squat', 'High Impact', 'Jump', 'Plyometric'],
  },
  shoulder: {
    excludeMuscleGroups: ['Shoulders', 'Anterior Deltoid', 'Rotator Cuff', 'Lateral Deltoids'],
    excludeExerciseTypes: ['Overhead Press', 'Lateral Raise', 'Heavy Snatch'],
  },
  back: {
    excludeMuscleGroups: ['Lower Back', 'Spine', 'Spinal Erectors', 'Lumbar'],
    excludeExerciseTypes: ['Axial Loading', 'Heavy Deadlift', 'Good Morning'],
  },
  wrist: {
    excludeMuscleGroups: ['Forearms', 'Wrists'],
    excludeExerciseTypes: ['Straight Barbell Curl', 'Heavy Front Squat Clean Grip'],
  },
  ankle: {
    excludeMuscleGroups: ['Calves', 'Ankles', 'Achilles'],
    excludeExerciseTypes: ['High Impact', 'Box Jump', 'Sprint', 'Jump Rope'],
  },
  neck: {
    excludeMuscleGroups: ['Neck', 'Upper Traps'],
    excludeExerciseTypes: ['Heavy Shrug', 'Behind the Neck Press'],
  },
  elbow: {
    excludeMuscleGroups: ['Triceps Isolation', 'Brachialis'],
    excludeExerciseTypes: ['Skull Crusher', 'French Press'],
  },
  hip: {
    excludeMuscleGroups: ['Hip Flexors', 'Abductors', 'Adductors'],
    excludeExerciseTypes: ['Deep Sumo Squat', 'Heavy Hip Thrust'],
  },
};

export class PlanClassificationError extends Error {
  constructor(message: string, public readonly invalidField: string, public readonly receivedValue: unknown) {
    super(`[PlanClassificationError]: ${message} (Field: ${invalidField}, Value: ${String(receivedValue)})`);
    this.name = 'PlanClassificationError';
  }
}

export class PlanGenerationError extends Error {
  constructor(
    public readonly dayIndex: number,
    public readonly dayLabel: string,
    public readonly targetMuscles: string[],
    public readonly reason: string
  ) {
    super(`[PlanGenerationError]: Failed to generate day ${dayIndex + 1} (${dayLabel}) for muscles [${targetMuscles.join(', ')}]. Reason: ${reason}`);
    this.name = 'PlanGenerationError';
  }
}

export interface PlanProfile {
  goal: Goal;
  fitnessLevel: FitnessLevel;
  daysPerWeek: number;
  equipmentAccess: EquipmentAccess;
  injuryTags: string[];
  goalRule: GoalRule;
  levelScale: { setsMultiplier: number; maxDifficulty: ExerciseDifficulty };
  excludedMuscles: Set<string>;
  excludedTypes: Set<string>;
}

export interface DayTemplate {
  dayIndex: number;
  dayLabel: string;
  focus: string;
  muscleTargets: string[];
  isCardioFocus?: boolean;
}

/**
 * Normalizes free-form or user input strings to exact Goal enum.
 */
export function normalizeGoal(raw?: string): Goal {
  if (!raw) {
    throw new PlanClassificationError('Primary goal is missing from profile.', 'primaryGoal', raw);
  }
  const clean = raw.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (['lose_weight', 'fat_loss', 'weight_loss', 'cutting', 'lean'].includes(clean)) return 'lose_weight';
  if (['build_muscle', 'muscle', 'hypertrophy', 'mass', 'bulking'].includes(clean)) return 'build_muscle';
  if (['strength', 'powerlifting', 'power', 'heavy'].includes(clean)) return 'strength';
  if (['endurance', 'cardio', 'stamina', 'running'].includes(clean)) return 'endurance';
  if (['general_fitness', 'better_health', 'improve_fitness', 'fitness', 'wellness', 'health', 'stress_management'].includes(clean)) return 'general_fitness';
  if (['mobility', 'flexibility', 'rehab', 'recovery'].includes(clean)) return 'mobility';

  throw new PlanClassificationError(`Unrecognized goal: "${raw}". Valid goals are: lose_weight, build_muscle, strength, endurance, general_fitness, mobility.`, 'primaryGoal', raw);
}

/**
 * Normalizes free-form or user input strings to exact FitnessLevel enum.
 */
export function normalizeFitnessLevel(raw?: string): FitnessLevel {
  if (!raw) {
    throw new PlanClassificationError('Fitness level is missing from profile.', 'fitnessLevel', raw);
  }
  const clean = raw.toLowerCase().trim();
  if (['beginner', 'novice', 'starter'].includes(clean)) return 'beginner';
  if (['intermediate', 'moderate', 'medium'].includes(clean)) return 'intermediate';
  if (['advanced', 'expert', 'experienced'].includes(clean)) return 'advanced';
  if (['athlete', 'elite', 'pro', 'competitive'].includes(clean)) return 'athlete';

  throw new PlanClassificationError(`Unrecognized fitness level: "${raw}". Valid levels are: beginner, intermediate, advanced, athlete.`, 'fitnessLevel', raw);
}

/**
 * Pure function: Classifies user profile and returns compiled PlanProfile.
 * Throws PlanClassificationError if mandatory inputs are invalid.
 */
export function classifyUser(profile: HealthProfile): PlanProfile {
  if (!profile) {
    throw new PlanClassificationError('HealthProfile is undefined.', 'profile', profile);
  }

  const goal = normalizeGoal(profile.primaryGoal);
  const fitnessLevel = normalizeFitnessLevel(profile.fitnessLevel);

  const daysPerWeek = typeof profile.daysPerWeek === 'number'
    ? Math.min(6, Math.max(2, profile.daysPerWeek))
    : 4;

  const equipmentAccess: EquipmentAccess = profile.equipmentAccess || 'full_gym';
  const rawInjuryTags = Array.isArray(profile.injuryTags) ? profile.injuryTags : [];

  const excludedMuscles = new Set<string>();
  const excludedTypes = new Set<string>();

  for (const tag of rawInjuryTags) {
    const cleanTag = tag.toLowerCase().trim();
    const mapping = INJURY_EXCLUSION_MAP[cleanTag];
    if (mapping) {
      mapping.excludeMuscleGroups.forEach(m => excludedMuscles.add(m.toLowerCase()));
      mapping.excludeExerciseTypes.forEach(t => excludedTypes.add(t.toLowerCase()));
    }
  }

  return {
    goal,
    fitnessLevel,
    daysPerWeek,
    equipmentAccess,
    injuryTags: rawInjuryTags,
    goalRule: GOAL_RULES[goal],
    levelScale: LEVEL_SCALING[fitnessLevel],
    excludedMuscles,
    excludedTypes,
  };
}

/**
 * Pure function: Determines SplitType from training frequency and fitness level.
 */
export function resolveSplitType(daysPerWeek: number, fitnessLevel: FitnessLevel): SplitType {
  if (daysPerWeek <= 3) {
    return 'full_body';
  }
  if (daysPerWeek === 4) {
    return 'upper_lower';
  }
  // 5 or 6 days
  if (fitnessLevel === 'advanced' || fitnessLevel === 'athlete') {
    return 'body_part';
  }
  return 'push_pull_legs';
}

/**
 * Pure function: Builds day muscle templates for any split type and frequency.
 */
export function buildDayTemplates(splitType: SplitType, daysPerWeek: number, goal?: Goal): DayTemplate[] {
  const days = Math.min(6, Math.max(2, daysPerWeek));

  if (splitType === 'full_body') {
    if (days === 2) {
      return [
        {
          dayIndex: 0,
          dayLabel: 'Day 1: Full Body (Compound Push & Squat Focus)',
          focus: 'Chest, Quads, Shoulders, Core',
          muscleTargets: ['Chest', 'Quads', 'Shoulders', 'Core'],
        },
        {
          dayIndex: 1,
          dayLabel: 'Day 2: Full Body (Hinge, Pull & Posterior Focus)',
          focus: 'Back, Hamstrings, Glutes, Arms',
          muscleTargets: ['Back', 'Hamstrings', 'Arms', 'Glutes'],
        },
      ];
    }
    // 3 Days Full Body
    return [
      {
        dayIndex: 0,
        dayLabel: 'Day 1: Full Body A (Squat & Push Priority)',
        focus: 'Chest, Quads, Shoulders, Triceps',
        muscleTargets: ['Chest', 'Quads', 'Shoulders', 'Arms'],
      },
      {
        dayIndex: 1,
        dayLabel: 'Day 2: Full Body B (Hinge & Pull Priority)',
        focus: 'Back, Hamstrings, Biceps, Core',
        muscleTargets: ['Back', 'Hamstrings', 'Arms', 'Core'],
      },
      {
        dayIndex: 2,
        dayLabel: 'Day 3: Full Body C (Athletic Power & Lunge Focus)',
        focus: 'Legs, Chest, Back, Core Stability',
        muscleTargets: ['Legs', 'Chest', 'Back', 'Core'],
      },
    ];
  }

  if (splitType === 'upper_lower') {
    return [
      {
        dayIndex: 0,
        dayLabel: 'Day 1: Upper Body Power (Chest, Back & Shoulders)',
        focus: 'Chest, Back, Shoulders, Arms',
        muscleTargets: ['Chest', 'Back', 'Shoulders', 'Arms'],
      },
      {
        dayIndex: 1,
        dayLabel: 'Day 2: Lower Body Power (Quads & Posterior Chain)',
        focus: 'Quads, Hamstrings, Glutes, Calves',
        muscleTargets: ['Quads', 'Hamstrings', 'Legs', 'Core'],
      },
      {
        dayIndex: 2,
        dayLabel: 'Day 3: Upper Body Hypertrophy & Volume',
        focus: 'Back, Chest, Delts, Arms',
        muscleTargets: ['Back', 'Chest', 'Shoulders', 'Arms'],
      },
      {
        dayIndex: 3,
        dayLabel: 'Day 4: Lower Body & Core Conditioning',
        focus: 'Hamstrings, Quads, Glutes, Core',
        muscleTargets: ['Hamstrings', 'Quads', 'Legs', 'Core'],
      },
    ];
  }

  if (splitType === 'push_pull_legs') {
    const baseTemplates: DayTemplate[] = [
      {
        dayIndex: 0,
        dayLabel: 'Day 1: Push (Chest, Shoulders & Triceps)',
        focus: 'Chest, Shoulders, Triceps',
        muscleTargets: ['Chest', 'Shoulders', 'Arms'],
      },
      {
        dayIndex: 1,
        dayLabel: 'Day 2: Pull (Back, Rear Delts & Biceps)',
        focus: 'Back, Lats, Biceps, Rear Delts',
        muscleTargets: ['Back', 'Arms', 'Shoulders'],
      },
      {
        dayIndex: 2,
        dayLabel: 'Day 3: Legs & Core (Quad, Hinge & Trunk)',
        focus: 'Quads, Hamstrings, Glutes, Core',
        muscleTargets: ['Quads', 'Hamstrings', 'Legs', 'Core'],
      },
    ];

    if (days === 4) {
      return [
        ...baseTemplates,
        {
          dayIndex: 3,
          dayLabel: 'Day 4: Upper Body Pump & Core Stability',
          focus: 'Chest, Back, Shoulders, Core',
          muscleTargets: ['Chest', 'Back', 'Shoulders', 'Core'],
        },
      ];
    }
    if (days === 5) {
      return [
        ...baseTemplates,
        {
          dayIndex: 3,
          dayLabel: 'Day 4: Upper Hypertrophy',
          focus: 'Chest, Back, Arms',
          muscleTargets: ['Chest', 'Back', 'Arms'],
        },
        {
          dayIndex: 4,
          dayLabel: 'Day 5: Lower Body & Core Volume',
          focus: 'Legs, Hamstrings, Core',
          muscleTargets: ['Legs', 'Hamstrings', 'Core'],
        },
      ];
    }
    // 6 Days PPL x 2
    return [
      { dayIndex: 0, dayLabel: 'Day 1: Push A (Heavy Press Focus)', focus: 'Chest, Shoulders, Triceps', muscleTargets: ['Chest', 'Shoulders', 'Arms'] },
      { dayIndex: 1, dayLabel: 'Day 2: Pull A (Heavy Row Focus)', focus: 'Back, Rear Delts, Biceps', muscleTargets: ['Back', 'Arms', 'Shoulders'] },
      { dayIndex: 2, dayLabel: 'Day 3: Legs A (Squat & Quad Focus)', focus: 'Quads, Calves, Core', muscleTargets: ['Quads', 'Legs', 'Core'] },
      { dayIndex: 3, dayLabel: 'Day 4: Push B (Hypertrophy & Incline)', focus: 'Upper Chest, Delts, Triceps', muscleTargets: ['Chest', 'Shoulders', 'Arms'] },
      { dayIndex: 4, dayLabel: 'Day 5: Pull B (Lat Pulldown & Arm Focus)', focus: 'Lats, Traps, Biceps', muscleTargets: ['Back', 'Arms'] },
      { dayIndex: 5, dayLabel: 'Day 6: Legs B (Hinge & Hamstring Focus)', focus: 'Hamstrings, Glutes, Core', muscleTargets: ['Hamstrings', 'Legs', 'Core'] },
    ];
  }

  // body_part (Bro Split / Specialist Split for Advanced/Athletes)
  return [
    { dayIndex: 0, dayLabel: 'Day 1: Chest & Triceps Specialization', focus: 'Chest, Triceps', muscleTargets: ['Chest', 'Arms'] },
    { dayIndex: 1, dayLabel: 'Day 2: Back & Biceps Specialization', focus: 'Back, Lats, Biceps', muscleTargets: ['Back', 'Arms'] },
    { dayIndex: 2, dayLabel: 'Day 3: Shoulders & Traps', focus: 'Shoulders, Rotator Cuff, Upper Back', muscleTargets: ['Shoulders', 'Back'] },
    { dayIndex: 3, dayLabel: 'Day 4: Quads & Anterior Legs', focus: 'Quads, Calves, Core', muscleTargets: ['Quads', 'Legs', 'Core'] },
    { dayIndex: 4, dayLabel: 'Day 5: Hamstrings, Glutes & Core', focus: 'Hamstrings, Glutes, Core', muscleTargets: ['Hamstrings', 'Legs', 'Core'] },
    ...(days === 6 ? [{
      dayIndex: 5,
      dayLabel: 'Day 6: Arms & Core Conditioning',
      focus: 'Biceps, Triceps, Core',
      muscleTargets: ['Arms', 'Core'],
    }] : []),
  ];
}

/**
 * Pure function: Maps user equipment access to permitted catalog equipment strings.
 */
export function isEquipmentPermitted(exerciseEquipment: string, access: EquipmentAccess): boolean {
  const eq = (exerciseEquipment || '').toLowerCase();
  if (access === 'none') {
    return eq.includes('bodyweight') || eq.includes('none') || eq.includes('mat') || eq.includes('calisthenic');
  }
  if (access === 'basic') {
    return eq.includes('bodyweight') || eq.includes('none') || eq.includes('dumbbell') || eq.includes('band') || eq.includes('pull-up');
  }
  // full_gym: all allowed
  return true;
}

/**
 * Pure function: Checks if exercise violates any of user's active injury exclusions.
 */
export function isExerciseSafeFromInjuries(
  exercise: Exercise,
  excludedMuscles: Set<string>,
  excludedTypes: Set<string>
): boolean {
  if (excludedMuscles.size === 0 && excludedTypes.size === 0) return true;

  const allExerciseMuscles = [
    ...(exercise.muscleGroups || []),
    ...(exercise.targetMuscles || []),
    ...(exercise.secondaryMuscles || []),
  ].map(m => m.toLowerCase());

  for (const m of allExerciseMuscles) {
    for (const excluded of excludedMuscles) {
      if (m.includes(excluded)) return false;
    }
  }

  const exType = (exercise.exerciseType || '').toLowerCase();
  for (const t of excludedTypes) {
    if (exType.includes(t)) return false;
  }

  return true;
}

/**
 * Pure function: Filters catalog exercises for a single training day template.
 */
export function filterExercisesForDay(
  catalog: Exercise[],
  template: DayTemplate,
  profile: PlanProfile
): Exercise[] {
  const difficultyRank: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  const maxDiffRank = difficultyRank[profile.levelScale.maxDifficulty] || 2;

  const filtered = catalog.filter(ex => {
    // 1. Difficulty ceiling
    const exDiffRank = difficultyRank[ex.difficulty] || 2;
    if (exDiffRank > maxDiffRank) return false;

    // 2. Equipment accessibility
    if (!isEquipmentPermitted(ex.equipment, profile.equipmentAccess)) return false;

    // 3. Injury exclusion safety
    if (!isExerciseSafeFromInjuries(ex, profile.excludedMuscles, profile.excludedTypes)) return false;

    // 4. Target muscle group match
    const exMuscles = [
      ...(ex.muscleGroups || []),
      ...(ex.targetMuscles || []),
    ].map(m => m.toLowerCase());

    const matchesMuscle = template.muscleTargets.some(target =>
      exMuscles.some(m => m.includes(target.toLowerCase()) || target.toLowerCase().includes(m))
    );

    return matchesMuscle;
  });

  return filtered;
}
