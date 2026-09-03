/**
 * Exercise Video & Presentation Metadata Models
 * FLUETAS TRAIN Database-Driven Video Streaming Architecture
 */

import { Timestamp } from 'firebase/firestore';

export type ExerciseVideoAudience = 'ALL' | 'MALE' | 'FEMALE';

export interface ExerciseVideoRecord {
  videoId: string;
  id?: string;
  exerciseId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  audience: ExerciseVideoAudience;
  instructor?: string;
  presentationType?: string; // e.g. 'Coaching Breakdown', 'Technique Cueing', 'Standard Reps'
  durationSec?: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExerciseVideoSelectionQuery {
  exerciseId: string;
  userProfile?: {
    gender?: string;
    fitnessLevel?: string;
    [key: string]: any;
  } | null;
  preferences?: {
    videoAudience?: ExerciseVideoAudience;
    preferredPresentation?: string;
    [key: string]: any;
  } | null;
}
