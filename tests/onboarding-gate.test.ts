import { describe, it, expect } from 'vitest';
import {
  calculateProfileCompleteness,
  isHealthEngineReady,
  isWorkoutPlanReady,
  UserProfile,
  HealthProfile,
} from '../src/lib/services/userService';
import {
  classifyUser,
  PlanClassificationError,
} from '../src/lib/services/planEngine';

describe('Customer Onboarding & Personalization Engine Gating', () => {
  describe('calculateProfileCompleteness', () => {
    it('returns 0% for an entirely empty profile', () => {
      const res = calculateProfileCompleteness(null, null);
      expect(res.pct).toBe(0);
      expect(res.completed.length).toBe(0);
      expect(res.remaining.length).toBe(15);
    });

    it('returns approximately 7% when only 1 required field (Full Name) is present', () => {
      const profile: Partial<UserProfile> = { name: 'John Doe' };
      const res = calculateProfileCompleteness(profile, null);
      expect(res.pct).toBe(7); // 1/15 = 6.66% -> 7%
      expect(res.completed).toContain('Full name');
      expect(res.remaining).toContain('Date of birth');
    });

    it('returns 100% when all 15 profile & fitness fields are populated', () => {
      const profile: Partial<UserProfile> = {
        name: 'Jane Doe',
        dob: '1995-06-15',
        gender: 'Female',
        heightCm: 168,
        weightKg: 62.5,
      };
      const healthProfile: Partial<HealthProfile> = {
        activityLevel: 'moderately_active',
        primaryGoal: 'build_muscle',
        fitnessLevel: 'Intermediate',
        experienceLevel: 'intermediate',
        daysPerWeek: 4,
        preferredSessionDuration: 45,
        equipmentAccess: 'full_gym',
        workoutLocation: 'commercial_gym',
        injuryTags: ['knee'],
        dietaryPreference: 'High Protein',
      };

      const res = calculateProfileCompleteness(profile, healthProfile);
      expect(res.pct).toBe(100);
      expect(res.remaining.length).toBe(0);
    });
  });

  describe('isHealthEngineReady Gate', () => {
    it('blocks health engine when baseline biometrics are missing', () => {
      const profile: Partial<UserProfile> = { name: 'Rahul' };
      const healthProfile: Partial<HealthProfile> = {};

      const res = isHealthEngineReady(profile, healthProfile);
      expect(res.ready).toBe(false);
      expect(res.missingFields).toContain('Date of Birth');
      expect(res.missingFields).toContain('Height');
      expect(res.missingFields).toContain('Weight');
      expect(res.missingFields).toContain('Fitness Goal');
    });

    it('authorizes health engine when all required biometrics are complete', () => {
      const profile: Partial<UserProfile> = {
        name: 'Rahul',
        dob: '1990-01-01',
        gender: 'Male',
        heightCm: 175,
        weightKg: 74,
      };
      const healthProfile: Partial<HealthProfile> = {
        activityLevel: 'moderately_active',
        primaryGoal: 'lose_weight',
        fitnessLevel: 'Beginner',
      };

      const res = isHealthEngineReady(profile, healthProfile);
      expect(res.ready).toBe(true);
      expect(res.missingFields.length).toBe(0);
    });
  });

  describe('isWorkoutPlanReady Gate (Section 5 Requirement)', () => {
    it('returns INCOMPLETE_PROFILE with missing fields for sparse customer profile', () => {
      const healthProfile: Partial<HealthProfile> = {
        primaryGoal: 'build_muscle',
        // Missing fitnessLevel, experienceLevel, daysPerWeek, preferredSessionDuration, equipmentAccess, workoutLocation, injuryTags
      };

      const res = isWorkoutPlanReady(null, healthProfile);
      expect(res.ready).toBe(false);
      expect(res.status).toBe('INCOMPLETE_PROFILE');
      expect(res.missingFields).toContain('Fitness Level');
      expect(res.missingFields).toContain('Experience Level');
      expect(res.missingFields).toContain('Workout Frequency (Days per week)');
      expect(res.missingFields).toContain('Equipment Access');
      expect(res.missingFields).toContain('Workout Location');
    });

    it('returns READY when all 8 workout personalization parameters exist', () => {
      const healthProfile: Partial<HealthProfile> = {
        primaryGoal: 'build_muscle',
        fitnessLevel: 'Intermediate',
        experienceLevel: 'intermediate',
        daysPerWeek: 4,
        preferredSessionDuration: 45,
        equipmentAccess: 'full_gym',
        workoutLocation: 'commercial_gym',
        injuryTags: [],
      };

      const res = isWorkoutPlanReady(null, healthProfile);
      expect(res.ready).toBe(true);
      expect(res.status).toBe('READY');
      expect(res.missingFields.length).toBe(0);
    });
  });

  describe('planEngine classifyUser (Zero Hidden Defaults Requirement)', () => {
    it('throws PlanClassificationError if daysPerWeek is missing or invalid', () => {
      const incompleteProfile: HealthProfile = {
        primaryGoal: 'build_muscle',
        fitnessLevel: 'Intermediate',
        equipmentAccess: 'full_gym',
        // daysPerWeek missing
      };

      expect(() => classifyUser(incompleteProfile)).toThrow(PlanClassificationError);
      expect(() => classifyUser(incompleteProfile)).toThrow(/Workout frequency/);
    });

    it('throws PlanClassificationError if equipmentAccess is missing', () => {
      const incompleteProfile: HealthProfile = {
        primaryGoal: 'build_muscle',
        fitnessLevel: 'Intermediate',
        daysPerWeek: 4,
        // equipmentAccess missing
      };

      expect(() => classifyUser(incompleteProfile)).toThrow(PlanClassificationError);
      expect(() => classifyUser(incompleteProfile)).toThrow(/Equipment access must be specified/);
    });

    it('successfully classifies when all parameters are provided', () => {
      const completeProfile: HealthProfile = {
        primaryGoal: 'build_muscle',
        fitnessLevel: 'Intermediate',
        daysPerWeek: 4,
        equipmentAccess: 'full_gym',
        injuryTags: ['knee'],
      };

      const classified = classifyUser(completeProfile);
      expect(classified.goal).toBe('build_muscle');
      expect(classified.fitnessLevel).toBe('intermediate');
      expect(classified.daysPerWeek).toBe(4);
      expect(classified.equipmentAccess).toBe('full_gym');
      expect(classified.excludedMuscles.has('quads')).toBe(true);
    });
  });
});
