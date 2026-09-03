/**
 * Unit Tests: Deterministic Workout Planning Engine (planEngine.ts)
 * Covers Goal Classification, Level Scaling, Split Determination,
 * Injury Exclusions, Progressive Overload, and Matrix QA.
 */

import { describe, it, expect } from 'vitest';
import {
  Goal,
  FitnessLevel,
  GOAL_RULES,
  LEVEL_SCALING,
  INJURY_EXCLUSION_MAP,
  normalizeGoal,
  normalizeFitnessLevel,
  classifyUser,
  resolveSplitType,
  buildDayTemplates,
  isEquipmentPermitted,
  isExerciseSafeFromInjuries,
  filterExercisesForDay,
  PlanClassificationError,
  PlanProfile,
} from '../src/lib/services/planEngine';
import { evaluateExerciseProgression } from '../src/lib/services/workoutPlanService';
import { FALLBACK_EXERCISES } from '../src/lib/exercises/fallbackCatalog';
import { WorkoutSession } from '../src/lib/services/workoutService';
import { Timestamp } from 'firebase/firestore';

describe('planEngine — Goal & Level Normalization', () => {
  it('correctly normalizes all 6 goal variations', () => {
    expect(normalizeGoal('Lose Weight')).toBe('lose_weight');
    expect(normalizeGoal('fat-loss')).toBe('lose_weight');
    expect(normalizeGoal('Build Muscle')).toBe('build_muscle');
    expect(normalizeGoal('Strength')).toBe('strength');
    expect(normalizeGoal('Endurance')).toBe('endurance');
    expect(normalizeGoal('Improve Fitness')).toBe('general_fitness');
    expect(normalizeGoal('Mobility')).toBe('mobility');
  });

  it('throws typed PlanClassificationError on invalid or missing goal', () => {
    expect(() => normalizeGoal(undefined)).toThrow(PlanClassificationError);
    expect(() => normalizeGoal('invalid_goal_xyz')).toThrow(PlanClassificationError);
  });

  it('correctly normalizes all 4 fitness levels', () => {
    expect(normalizeFitnessLevel('Beginner')).toBe('beginner');
    expect(normalizeFitnessLevel('intermediate')).toBe('intermediate');
    expect(normalizeFitnessLevel('ADVANCED')).toBe('advanced');
    expect(normalizeFitnessLevel('Athlete')).toBe('athlete');
  });

  it('throws typed PlanClassificationError on invalid or missing fitness level', () => {
    expect(() => normalizeFitnessLevel(undefined)).toThrow(PlanClassificationError);
    expect(() => normalizeFitnessLevel('superhuman')).toThrow(PlanClassificationError);
  });
});

describe('planEngine — classifyUser & Rules Table Verification', () => {
  it('matches exact hardcoded GOAL_RULES requirements', () => {
    expect(GOAL_RULES.lose_weight.repRange).toEqual([12, 15]);
    expect(GOAL_RULES.lose_weight.restSeconds).toBe(45);
    expect(GOAL_RULES.lose_weight.cardioMinutes).toBe(20);

    expect(GOAL_RULES.build_muscle.repRange).toEqual([8, 12]);
    expect(GOAL_RULES.build_muscle.restSeconds).toBe(75);
    expect(GOAL_RULES.build_muscle.cardioMinutes).toBe(0);

    expect(GOAL_RULES.strength.repRange).toEqual([3, 6]);
    expect(GOAL_RULES.strength.restSeconds).toBe(150);
    expect(GOAL_RULES.strength.cardioMinutes).toBe(0);

    expect(GOAL_RULES.endurance.repRange).toEqual([15, 20]);
    expect(GOAL_RULES.endurance.restSeconds).toBe(25);
    expect(GOAL_RULES.endurance.cardioMinutes).toBe(25);

    expect(GOAL_RULES.general_fitness.repRange).toEqual([10, 12]);
    expect(GOAL_RULES.general_fitness.restSeconds).toBe(60);

    expect(GOAL_RULES.mobility.repRange).toEqual([8, 10]);
    expect(GOAL_RULES.mobility.restSeconds).toBe(30);
  });

  it('matches exact LEVEL_SCALING multiplier & max difficulty requirements', () => {
    expect(LEVEL_SCALING.beginner).toEqual({ setsMultiplier: 0.8, maxDifficulty: 'Beginner' });
    expect(LEVEL_SCALING.intermediate).toEqual({ setsMultiplier: 1.0, maxDifficulty: 'Intermediate' });
    expect(LEVEL_SCALING.advanced).toEqual({ setsMultiplier: 1.2, maxDifficulty: 'Advanced' });
    expect(LEVEL_SCALING.athlete).toEqual({ setsMultiplier: 1.4, maxDifficulty: 'Advanced' });
  });

  it('compiles user profile into PlanProfile with injury exclusion sets', () => {
    const profile = {
      primaryGoal: 'Build Muscle',
      fitnessLevel: 'Intermediate',
      daysPerWeek: 4,
      equipmentAccess: 'full_gym' as const,
      injuryTags: ['knee', 'shoulder'],
    };

    const classified = classifyUser(profile);
    expect(classified.goal).toBe('build_muscle');
    expect(classified.fitnessLevel).toBe('intermediate');
    expect(classified.daysPerWeek).toBe(4);
    expect(classified.excludedMuscles.has('quads')).toBe(true);
    expect(classified.excludedMuscles.has('shoulders')).toBe(true);
    expect(classified.excludedTypes.has('overhead press')).toBe(true);
  });
});

describe('planEngine — Split Resolution & Day Templates', () => {
  it('resolves 2-3 days to full_body', () => {
    expect(resolveSplitType(2, 'beginner')).toBe('full_body');
    expect(resolveSplitType(3, 'intermediate')).toBe('full_body');
  });

  it('resolves 4 days to upper_lower', () => {
    expect(resolveSplitType(4, 'intermediate')).toBe('upper_lower');
  });

  it('resolves 5-6 days to push_pull_legs or body_part based on fitness level', () => {
    expect(resolveSplitType(5, 'beginner')).toBe('push_pull_legs');
    expect(resolveSplitType(6, 'intermediate')).toBe('push_pull_legs');
    expect(resolveSplitType(5, 'advanced')).toBe('body_part');
    expect(resolveSplitType(6, 'athlete')).toBe('body_part');
  });

  it('builds day templates covering every day without empty targets', () => {
    const splitTypes = ['full_body', 'upper_lower', 'push_pull_legs', 'body_part'] as const;
    for (const split of splitTypes) {
      for (let days = 2; days <= 6; days++) {
        const templates = buildDayTemplates(split, days);
        expect(templates.length).toBeGreaterThanOrEqual(2);
        templates.forEach((t, idx) => {
          expect(t.dayIndex).toBe(idx);
          expect(t.muscleTargets.length).toBeGreaterThan(0);
          expect(t.dayLabel).toBeTruthy();
        });
      }
    }
  });
});

describe('planEngine — Equipment & Safety Injury Exclusions', () => {
  it('verifies equipment accessibility rules', () => {
    expect(isEquipmentPermitted('Bodyweight', 'none')).toBe(true);
    expect(isEquipmentPermitted('Barbell', 'none')).toBe(false);
    expect(isEquipmentPermitted('Dumbbell', 'basic')).toBe(true);
    expect(isEquipmentPermitted('Barbell', 'basic')).toBe(false);
    expect(isEquipmentPermitted('Barbell', 'full_gym')).toBe(true);
    expect(isEquipmentPermitted('Cable', 'full_gym')).toBe(true);
  });

  it('strictly excludes contraindicated exercises for knee injuries', () => {
    const kneeExclusions = INJURY_EXCLUSION_MAP['knee'];
    const excludedMuscles = new Set(kneeExclusions.excludeMuscleGroups.map(m => m.toLowerCase()));
    const excludedTypes = new Set(kneeExclusions.excludeExerciseTypes.map(t => t.toLowerCase()));

    const squatEx = FALLBACK_EXERCISES.find(e => e.id === 'barbell-back-squat')!;
    const benchEx = FALLBACK_EXERCISES.find(e => e.id === 'barbell-bench-press')!;
    const gluteBridgeEx = FALLBACK_EXERCISES.find(e => e.id === 'glute-bridge')!;

    expect(isExerciseSafeFromInjuries(squatEx, excludedMuscles, excludedTypes)).toBe(false);
    expect(isExerciseSafeFromInjuries(benchEx, excludedMuscles, excludedTypes)).toBe(true);
  });

  it('strictly excludes overhead shoulder movements for shoulder injuries', () => {
    const shoulderExclusions = INJURY_EXCLUSION_MAP['shoulder'];
    const excludedMuscles = new Set(shoulderExclusions.excludeMuscleGroups.map(m => m.toLowerCase()));
    const excludedTypes = new Set(shoulderExclusions.excludeExerciseTypes.map(t => t.toLowerCase()));

    const ohpEx = FALLBACK_EXERCISES.find(e => e.id === 'standing-overhead-press')!;
    const latRaiseEx = FALLBACK_EXERCISES.find(e => e.id === 'dumbbell-lateral-raise')!;
    const squatEx = FALLBACK_EXERCISES.find(e => e.id === 'barbell-back-squat')!;

    expect(isExerciseSafeFromInjuries(ohpEx, excludedMuscles, excludedTypes)).toBe(false);
    expect(isExerciseSafeFromInjuries(latRaiseEx, excludedMuscles, excludedTypes)).toBe(false);
    expect(isExerciseSafeFromInjuries(squatEx, excludedMuscles, excludedTypes)).toBe(true);
  });
});

describe('planEngine — Progressive Overload Evaluation', () => {
  const dummySession = (done: boolean, weight = '50', id = 'barbell-bench-press'): WorkoutSession => ({
    id: `sess-${Math.random()}`,
    userId: 'user-1',
    date: '2026-09-01',
    workoutName: 'Chest & Arms',
    workoutType: 'Strength',
    startTime: Timestamp.now(),
    status: 'completed',
    exercises: [
      {
        id,
        name: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { set: 1, reps: '8', weight, done },
          { set: 2, reps: '8', weight, done },
          { set: 3, reps: '8', weight, done },
        ],
      },
    ],
  });

  it('suggests baseline for new exercise with zero previous sessions', () => {
    const res = evaluateExerciseProgression('barbell-bench-press', 'Barbell Bench Press', 'build_muscle', []);
    expect(res.status).toBe('baseline');
  });

  it('suggests +2.5kg weight progression when all sets are successfully completed', () => {
    const pastSessions = [dummySession(true, '40')];
    const res = evaluateExerciseProgression('barbell-bench-press', 'Barbell Bench Press', 'build_muscle', pastSessions);
    expect(res.status).toBe('progress');
    expect(res.suggestedWeight).toBe(42.5);
  });

  it('suggests maintaining weight when any set is missed in current session', () => {
    const pastSessions = [dummySession(false, '40')];
    const res = evaluateExerciseProgression('barbell-bench-press', 'Barbell Bench Press', 'build_muscle', pastSessions);
    expect(res.status).toBe('maintain');
    expect(res.suggestedWeight).toBe(40);
  });

  it('suggests reducing target rep range when two consecutive sessions fail', () => {
    const pastSessions = [dummySession(false, '50'), dummySession(false, '50')];
    const res = evaluateExerciseProgression('barbell-bench-press', 'Barbell Bench Press', 'build_muscle', pastSessions);
    expect(res.status).toBe('deload_reps');
    expect(res.suggestedReps).toBe('8-10');
  });
});

describe('planEngine — QA Matrix (All Goals x Splits x Equipment)', () => {
  const allGoals: Goal[] = ['lose_weight', 'build_muscle', 'strength', 'endurance', 'general_fitness', 'mobility'];
  const allSplitDays = [2, 3, 4, 5, 6];

  for (const goal of allGoals) {
    for (const days of allSplitDays) {
      it(`generates non-empty exercise sets for ${goal} at ${days} days/week on full_gym`, () => {
        const profile: PlanProfile = classifyUser({
          primaryGoal: goal,
          fitnessLevel: 'Intermediate',
          daysPerWeek: days,
          equipmentAccess: 'full_gym',
          injuryTags: [],
        });

        const splitType = resolveSplitType(days, profile.fitnessLevel);
        const dayTemplates = buildDayTemplates(splitType, days, goal);

        for (const template of dayTemplates) {
          const exercises = filterExercisesForDay(FALLBACK_EXERCISES, template, profile);
          expect(exercises.length).toBeGreaterThanOrEqual(1);
        }
      });
    }
  }
});
