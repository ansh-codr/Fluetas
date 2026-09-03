/**
 * Exercise Video Service
 * FLUETAS TRAIN Real Backend Video Resolution & Presentation Engine
 * Enforces preference hierarchy: user preference -> profile presentation match -> universal 'ALL' -> null (safe fallback).
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  ExerciseVideoRecord,
  ExerciseVideoSelectionQuery,
  ExerciseVideoAudience,
} from '@/lib/exercises/videoTypes';
import { FALLBACK_EXERCISES } from '@/lib/exercises/fallbackCatalog';

/**
 * Standard baseline curated demonstration library with multi-audience variants.
 */
export const SEED_EXERCISE_VIDEOS: Omit<ExerciseVideoRecord, 'createdAt' | 'updatedAt'>[] = [
  // ── Barbell Bench Press ──
  {
    videoId: 'vid_bench_all',
    exerciseId: 'barbell-bench-press',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    audience: 'ALL',
    instructor: 'Coach Marcus & Coach Elena (FLUETAS Performance Lab)',
    presentationType: 'Biomechanical Setup & Arch Control',
    durationSec: 45,
    active: true,
  },
  {
    videoId: 'vid_bench_male',
    exerciseId: 'barbell-bench-press',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    audience: 'MALE',
    instructor: 'Coach Marcus',
    presentationType: 'Powerlifting Arc & Leg Drive Cueing',
    durationSec: 42,
    active: true,
  },
  {
    videoId: 'vid_bench_female',
    exerciseId: 'barbell-bench-press',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    audience: 'FEMALE',
    instructor: 'Coach Elena',
    presentationType: 'Scapular Retraction & Grip Width Optimization',
    durationSec: 48,
    active: true,
  },

  // ── Barbell Back Squat ──
  {
    videoId: 'vid_squat_all',
    exerciseId: 'barbell-back-squat',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    audience: 'ALL',
    instructor: 'Dr. Anjali Mehta & Coach Marcus',
    presentationType: 'Femur Geometry & Depth Mechanics',
    durationSec: 55,
    active: true,
  },
  {
    videoId: 'vid_squat_female',
    exerciseId: 'barbell-back-squat',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    audience: 'FEMALE',
    instructor: 'Coach Elena',
    presentationType: 'Pelvic Floor Bracing & High-Bar Positioning',
    durationSec: 50,
    active: true,
  },

  // ── Conventional Deadlift ──
  {
    videoId: 'vid_deadlift_all',
    exerciseId: 'barbell-deadlift',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=600&q=80',
    audience: 'ALL',
    instructor: 'FLUETAS Strength Team',
    presentationType: 'Wedge Tension & Hip Hinge Mechanics',
    durationSec: 60,
    active: true,
  },

  // ── Overhead Shoulder Press ──
  {
    videoId: 'vid_ohp_all',
    exerciseId: 'overhead-shoulder-press',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    audience: 'ALL',
    instructor: 'Coach Marcus',
    presentationType: 'Strict Vertical Bar Path & Glute Squeeze',
    durationSec: 40,
    active: true,
  },

  // ── Incline Dumbbell Press ──
  {
    videoId: 'vid_incline_db_all',
    exerciseId: 'incline-dumbbell-press',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    audience: 'ALL',
    instructor: 'Coach Elena',
    presentationType: '30-Degree Incline Clavicular Focus',
    durationSec: 38,
    active: true,
  },

  // ── Push-Up ──
  {
    videoId: 'vid_pushup_all',
    exerciseId: 'push-ups',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80',
    audience: 'ALL',
    instructor: 'FLUETAS Calisthenics Team',
    presentationType: 'Hollow Body Plank & Elbow Tucking',
    durationSec: 35,
    active: true,
  },

  // ── Barbell Bent-Over Row ──
  {
    videoId: 'vid_row_all',
    exerciseId: 'barbell-bent-over-row',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80',
    audience: 'ALL',
    instructor: 'Coach Marcus',
    presentationType: 'Lat Engagement & Spine Neutrality',
    durationSec: 44,
    active: true,
  },
];

/**
 * Resolves the target audience preference given user profile and explicit settings.
 */
export function resolveTargetAudience(
  userProfile?: { gender?: string } | null,
  preferences?: { videoAudience?: ExerciseVideoAudience } | null
): ExerciseVideoAudience | null {
  if (preferences?.videoAudience && ['ALL', 'MALE', 'FEMALE'].includes(preferences.videoAudience)) {
    return preferences.videoAudience;
  }

  const rawGender = userProfile?.gender?.toLowerCase() || '';
  if (rawGender === 'female' || rawGender === 'woman') {
    return 'FEMALE';
  }
  if (rawGender === 'male' || rawGender === 'man') {
    return 'MALE';
  }

  return null;
}

/**
 * Centralized video resolution engine.
 * Selects the optimal active video record for an exercise according to the hierarchy:
 * 1. Explicit user/profile preference
 * 2. Relevant specialized audience variant
 * 3. ALL / universal video
 * 4. Null (triggering safe "Video in production" fallback state)
 */
export async function getPreferredExerciseVideo(
  selectionQuery: ExerciseVideoSelectionQuery
): Promise<ExerciseVideoRecord | null> {
  const { exerciseId, userProfile, preferences } = selectionQuery;
  if (!exerciseId) return null;

  let records: ExerciseVideoRecord[] = [];

  // 1. Query Firestore /exerciseVideos collection
  if (db) {
    try {
      const q = query(
        collection(db, 'exerciseVideos'),
        where('exerciseId', '==', exerciseId),
        where('active', '==', true)
      );
      const snap = await getDocs(q);
      records = snap.docs.map(d => ({ videoId: d.id, id: d.id, ...d.data() } as ExerciseVideoRecord));
    } catch (err) {
      console.warn('[ExerciseVideoService] Firestore query error, falling back to local registry:', err);
    }
  }

  // 2. Fallback to bundled seed registry if database is empty or offline
  if (records.length === 0) {
    const matchedSeed = SEED_EXERCISE_VIDEOS.filter(
      v => v.exerciseId === exerciseId && v.active
    );
    const now = Timestamp.now();
    records = matchedSeed.map(v => ({
      ...v,
      createdAt: now,
      updatedAt: now,
    }));
  }

  if (records.length === 0) {
    return null;
  }

  const targetAudience = resolveTargetAudience(userProfile, preferences);

  // Hierarchy Step 1 & 2: Exact audience match (e.g. FEMALE or MALE)
  if (targetAudience && targetAudience !== 'ALL') {
    const exactMatch = records.find(r => r.audience === targetAudience);
    if (exactMatch) return exactMatch;
  }

  // Hierarchy Step 3: Universal 'ALL' demonstration
  const universalMatch = records.find(r => r.audience === 'ALL');
  if (universalMatch) return universalMatch;

  // If only a specialized variant exists and no ALL, use the first available active record
  return records[0] || null;
}

/**
 * Returns all available presentation variants for an exercise.
 */
export async function getExerciseVideoVariants(
  exerciseId: string
): Promise<ExerciseVideoRecord[]> {
  if (!exerciseId) return [];

  if (db) {
    try {
      const q = query(
        collection(db, 'exerciseVideos'),
        where('exerciseId', '==', exerciseId),
        where('active', '==', true)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ videoId: d.id, id: d.id, ...d.data() } as ExerciseVideoRecord));
      }
    } catch (err) {
      console.warn('[ExerciseVideoService] getExerciseVideoVariants error:', err);
    }
  }

  const matched = SEED_EXERCISE_VIDEOS.filter(v => v.exerciseId === exerciseId && v.active);
  const now = Timestamp.now();
  return matched.map(v => ({ ...v, createdAt: now, updatedAt: now }));
}

/**
 * Seeds the standard exercise catalog and video library into Cloud Firestore
 * if records do not exist.
 */
export async function seedExerciseCatalogAndVideos(): Promise<{ exercisesCount: number; videosCount: number }> {
  if (!db) throw new Error('Firebase database not configured');

  const now = Timestamp.now();
  let exCount = 0;
  let vidCount = 0;

  // Seed Exercises
  for (const ex of FALLBACK_EXERCISES) {
    const exRef = doc(db, 'exercises', ex.id);
    const snap = await getDoc(exRef);
    if (!snap.exists()) {
      await setDoc(exRef, {
        exerciseId: ex.id,
        name: ex.name,
        slug: ex.slug,
        targetMuscles: ex.targetMuscles || [],
        secondaryMuscles: ex.secondaryMuscles || [],
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        exerciseType: ex.exerciseType,
        instructions: ex.instructions || [],
        formCues: ex.formCues || [],
        commonMistakes: ex.commonMistakes || [],
        breathing: ex.breathing || '',
        thumbnailUrl: ex.thumbnailUrl || '',
        active: true,
        createdAt: now,
        updatedAt: now,
      });
      exCount++;
    }
  }

  // Seed Videos
  for (const vid of SEED_EXERCISE_VIDEOS) {
    const vidRef = doc(db, 'exerciseVideos', vid.videoId);
    const snap = await getDoc(vidRef);
    if (!snap.exists()) {
      await setDoc(vidRef, {
        ...vid,
        createdAt: now,
        updatedAt: now,
      });
      vidCount++;
    }
  }

  return { exercisesCount: exCount, videosCount: vidCount };
}
