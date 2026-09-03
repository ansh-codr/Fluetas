import { describe, it, expect } from 'vitest';
import {
  resolveTargetAudience,
  getPreferredExerciseVideo,
  SEED_EXERCISE_VIDEOS,
} from '@/lib/services/exerciseVideoService';

describe('Exercise Video Selection & Presentation Engine', () => {
  it('resolves audience directly from user preferences if specified', () => {
    expect(resolveTargetAudience(null, { videoAudience: 'FEMALE' })).toBe('FEMALE');
    expect(resolveTargetAudience(null, { videoAudience: 'MALE' })).toBe('MALE');
    expect(resolveTargetAudience(null, { videoAudience: 'ALL' })).toBe('ALL');
  });

  it('resolves audience from user profile gender when preferences not set', () => {
    expect(resolveTargetAudience({ gender: 'female' }, null)).toBe('FEMALE');
    expect(resolveTargetAudience({ gender: 'Woman' }, null)).toBe('FEMALE');
    expect(resolveTargetAudience({ gender: 'male' }, null)).toBe('MALE');
    expect(resolveTargetAudience({ gender: 'Man' }, null)).toBe('MALE');
  });

  it('returns null audience when no gender or preference is specified', () => {
    expect(resolveTargetAudience(null, null)).toBeNull();
    expect(resolveTargetAudience({ gender: 'prefer_not_to_say' }, null)).toBeNull();
  });

  it('selects FEMALE video variant when user profile indicates female and variant exists', async () => {
    const video = await getPreferredExerciseVideo({
      exerciseId: 'barbell-bench-press',
      userProfile: { gender: 'female' },
      preferences: null,
    });

    expect(video).not.toBeNull();
    expect(video?.audience).toBe('FEMALE');
    expect(video?.instructor).toContain('Elena');
  });

  it('selects MALE video variant when user profile indicates male and variant exists', async () => {
    const video = await getPreferredExerciseVideo({
      exerciseId: 'barbell-bench-press',
      userProfile: { gender: 'male' },
      preferences: null,
    });

    expect(video).not.toBeNull();
    expect(video?.audience).toBe('MALE');
    expect(video?.instructor).toContain('Marcus');
  });

  it('falls back to universal ALL video when specialized variant does not exist', async () => {
    // conventional deadlift only has an ALL seed video
    const video = await getPreferredExerciseVideo({
      exerciseId: 'barbell-deadlift',
      userProfile: { gender: 'female' },
      preferences: null,
    });

    expect(video).not.toBeNull();
    expect(video?.audience).toBe('ALL');
  });

  it('returns null when exercise is not in catalog/video database', async () => {
    const video = await getPreferredExerciseVideo({
      exerciseId: 'nonexistent-acrobatic-movement',
      userProfile: null,
      preferences: null,
    });

    expect(video).toBeNull();
  });

  it('seed registry has valid videoUrls, titles, and active statuses', () => {
    expect(SEED_EXERCISE_VIDEOS.length).toBeGreaterThanOrEqual(10);
    for (const v of SEED_EXERCISE_VIDEOS) {
      expect(v.exerciseId).toBeTruthy();
      expect(v.videoUrl).toMatch(/^https?:\/\//);
      expect(['ALL', 'MALE', 'FEMALE']).toContain(v.audience);
      expect(v.active).toBe(true);
    }
  });
});
