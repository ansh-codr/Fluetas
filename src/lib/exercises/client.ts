/**
 * Frontend Exercise API Client
 * Talks strictly to FLUETAS internal API routes. Never calls external API directly.
 */

import { Exercise, BrowseExercisesParams, BrowseExercisesResult } from './types';

export async function fetchExercises(params: BrowseExercisesParams = {}): Promise<BrowseExercisesResult> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.muscle) query.set('muscle', params.muscle);
  if (params.equipment) query.set('equipment', params.equipment);
  if (params.difficulty) query.set('difficulty', params.difficulty);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.includeVideos) query.set('includeVideos', 'true');

  const res = await fetch(`/api/exercises?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch exercises: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchExerciseById(id: string, includeVideo = true): Promise<Exercise> {
  const res = await fetch(`/api/exercises/${encodeURIComponent(id)}?includeVideo=${includeVideo}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch exercise details for ${id}: ${res.statusText}`);
  }
  return res.json();
}
