'use client';

import { useState, useEffect, useCallback } from 'react';
import { Exercise, BrowseExercisesParams, BrowseExercisesResult } from '@/lib/exercises/types';
import { fetchExercises, fetchExerciseById } from '@/lib/exercises/client';

export function useExerciseLibrary(params: BrowseExercisesParams = {}) {
  const [data, setData] = useState<BrowseExercisesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExercises(params);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, [
    params.search,
    params.muscle,
    params.equipment,
    params.difficulty,
    params.page,
    params.limit,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    exercises: data?.exercises || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    page: data?.page || 1,
    provider: data?.provider || 'Unknown',
    isFallback: data?.isFallback || false,
    loading,
    error,
    reload: loadData,
  };
}

import { ExerciseVideoRecord } from '@/lib/exercises/videoTypes';
import { getPreferredExerciseVideo } from '@/lib/services/exerciseVideoService';

export function useExerciseDetail(
  exerciseId: string | null,
  userProfile?: { gender?: string; [key: string]: any } | null,
  preferences?: { videoAudience?: any; [key: string]: any } | null
) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [preferredVideo, setPreferredVideo] = useState<ExerciseVideoRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoExpired, setVideoExpired] = useState(false);

  const loadExercise = useCallback(async (isRetry = false) => {
    if (!exerciseId) {
      setExercise(null);
      setPreferredVideo(null);
      return;
    }
    setLoading(true);
    setError(null);
    if (isRetry) setVideoExpired(false);

    try {
      const [data, video] = await Promise.all([
        fetchExerciseById(exerciseId, true),
        getPreferredExerciseVideo({ exerciseId, userProfile, preferences }),
      ]);
      setExercise(data);
      setPreferredVideo(video);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercise video and details');
    } finally {
      setLoading(false);
    }
  }, [exerciseId, userProfile, preferences]);

  useEffect(() => {
    if (exerciseId) {
      loadExercise();
    }
  }, [exerciseId, loadExercise]);

  const handleVideoError = useCallback(() => {
    console.warn(`[Exercise Video] Video stream error/expired for ${exerciseId}. Triggering refresh.`);
    setVideoExpired(true);
  }, [exerciseId]);

  const refreshVideoUrl = useCallback(() => {
    loadExercise(true);
  }, [loadExercise]);

  return {
    exercise,
    preferredVideo,
    loading,
    error,
    videoExpired,
    handleVideoError,
    refreshVideoUrl,
    reload: () => loadExercise(false),
  };
}
