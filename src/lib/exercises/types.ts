/**
 * Normalized Exercise Data Models
 * FLUETAS TRAIN API-Based Video Integration
 */

export type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  muscleGroups: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: ExerciseDifficulty | string;
  exerciseType: string;
  instructions: string[];
  steps?: string[];
  formCues: string[];
  commonMistakes: string[];
  breathing?: string;
  thumbnailUrl?: string;
  /**
   * Video URL is runtime temporary signed CDN URL.
   * Do NOT permanently persist in Firestore.
   */
  videoUrl?: string;
  videoProvider: string;
}

export interface BrowseExercisesParams {
  search?: string;
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
  includeVideos?: boolean;
}

export interface BrowseExercisesResult {
  exercises: Exercise[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  provider: string;
  isFallback?: boolean;
}

export interface ExerciseProvider {
  name: string;
  getExercises(params?: BrowseExercisesParams): Promise<BrowseExercisesResult>;
  getExerciseById(id: string, includeVideo?: boolean): Promise<Exercise | null>;
  searchExercises(query: string, params?: BrowseExercisesParams): Promise<Exercise[]>;
  getExercisesByMuscle(muscle: string, params?: BrowseExercisesParams): Promise<Exercise[]>;
  getExercisesByEquipment(equipment: string, params?: BrowseExercisesParams): Promise<Exercise[]>;
}
