/**
 * Your Move Exercise API Provider Implementation
 * Server-side only: uses process.env.YMOVE_API_KEY
 * Base API: https://exercise-api.ymove.app/api/v2
 */

import { Exercise, ExerciseProvider, BrowseExercisesParams, BrowseExercisesResult } from './types';
import { FALLBACK_EXERCISES } from './fallbackCatalog';

const YMOVE_BASE_URL = process.env.YMOVE_BASE_URL || 'https://exercise-api.ymove.app/api/v2';

export class YourMoveExerciseProvider implements ExerciseProvider {
  public name = 'YourMove';
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.YMOVE_API_KEY || null;
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'x-api-key': this.apiKey || '',
    };
  }

  /**
   * Normalizes an external Your Move API record into the standard FLUETAS Exercise model.
   */
  private normalizeExercise(data: any, includeVideo = false): Exercise {
    return {
      id: String(data.id || data._id || data.slug || 'unknown'),
      name: data.name || data.title || 'Untitled Exercise',
      slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'exercise'),
      muscleGroups: Array.isArray(data.muscleGroups)
        ? data.muscleGroups
        : data.bodyPart ? [data.bodyPart] : data.target ? [data.target] : ['Full Body'],
      targetMuscles: Array.isArray(data.targetMuscles)
        ? data.targetMuscles
        : data.target ? [data.target] : [],
      secondaryMuscles: Array.isArray(data.secondaryMuscles) ? data.secondaryMuscles : [],
      equipment: data.equipment || data.apparatus || 'Bodyweight',
      difficulty: data.difficulty || data.level || 'Intermediate',
      exerciseType: data.exerciseType || data.category || 'Strength',
      instructions: Array.isArray(data.instructions)
        ? data.instructions
        : typeof data.instructions === 'string'
        ? data.instructions.split('\n').filter(Boolean)
        : [],
      steps: Array.isArray(data.steps) ? data.steps : undefined,
      formCues: Array.isArray(data.formCues)
        ? data.formCues
        : Array.isArray(data.cues) ? data.cues : [],
      commonMistakes: Array.isArray(data.commonMistakes)
        ? data.commonMistakes
        : Array.isArray(data.mistakes) ? data.mistakes : [],
      breathing: data.breathing || data.breathingPattern || undefined,
      thumbnailUrl: data.thumbnailUrl || data.gifUrl || data.image || undefined,
      // Video URL is temporary signed URL returned by provider
      videoUrl: includeVideo ? (data.videoUrl || data.streamUrl || data.signedVideoUrl || undefined) : undefined,
      videoProvider: 'YourMove',
    };
  }

  public async getExercises(params: BrowseExercisesParams = {}): Promise<BrowseExercisesResult> {
    const {
      search,
      muscle,
      equipment,
      difficulty,
      page = 1,
      limit = 20,
      includeVideos = false,
    } = params;

    if (!this.isConfigured()) {
      return this.getFallbackExercises(params);
    }

    try {
      const url = new URL(`${YMOVE_BASE_URL}/exercises`);
      if (search) url.searchParams.set('search', search);
      if (muscle && muscle !== 'All') url.searchParams.set('muscle', muscle);
      if (equipment && equipment !== 'All') url.searchParams.set('equipment', equipment);
      if (difficulty && difficulty !== 'All') url.searchParams.set('difficulty', difficulty);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(limit));
      // By default browse does NOT request heavy video URLs
      url.searchParams.set('includeVideos', String(includeVideos));

      const response = await fetch(url.toString(), {
        headers: this.getHeaders(),
        next: { revalidate: 3600 }, // Safe to cache metadata
      });

      if (!response.ok) {
        console.warn(`[YourMove API] Request failed status: ${response.status}. Using fallback catalog.`);
        return this.getFallbackExercises(params);
      }

      const json = await response.json();
      const rawList: any[] = Array.isArray(json) ? json : json.data || json.exercises || [];
      const total = typeof json.total === 'number' ? json.total : rawList.length;

      const exercises = rawList.map(item => this.normalizeExercise(item, includeVideos));

      return {
        exercises,
        total,
        page,
        limit,
        hasMore: page * limit < total,
        provider: this.name,
      };
    } catch (err) {
      console.warn('[YourMove API] Fetch error:', err);
      return this.getFallbackExercises(params);
    }
  }

  public async getExerciseById(id: string, includeVideo = true): Promise<Exercise | null> {
    if (!this.isConfigured()) {
      const found = FALLBACK_EXERCISES.find(e => e.id === id || e.slug === id);
      return found || null;
    }

    try {
      const url = new URL(`${YMOVE_BASE_URL}/exercises/${encodeURIComponent(id)}`);
      if (includeVideo) {
        url.searchParams.set('includeVideo', 'true');
      }

      const response = await fetch(url.toString(), {
        headers: this.getHeaders(),
        cache: 'no-store', // Do NOT cache signed temporary video URLs!
      });

      if (!response.ok) {
        // Fallback to local catalog if not found in external provider
        const found = FALLBACK_EXERCISES.find(e => e.id === id || e.slug === id);
        return found || null;
      }

      const json = await response.json();
      const raw = json.data || json;
      return this.normalizeExercise(raw, includeVideo);
    } catch (err) {
      console.warn(`[YourMove API] getExerciseById error for ${id}:`, err);
      const found = FALLBACK_EXERCISES.find(e => e.id === id || e.slug === id);
      return found || null;
    }
  }

  public async searchExercises(query: string, params: BrowseExercisesParams = {}): Promise<Exercise[]> {
    const res = await this.getExercises({ ...params, search: query });
    return res.exercises;
  }

  public async getExercisesByMuscle(muscle: string, params: BrowseExercisesParams = {}): Promise<Exercise[]> {
    const res = await this.getExercises({ ...params, muscle });
    return res.exercises;
  }

  public async getExercisesByEquipment(equipment: string, params: BrowseExercisesParams = {}): Promise<Exercise[]> {
    const res = await this.getExercises({ ...params, equipment });
    return res.exercises;
  }

  /**
   * Filter and paginate local fallback exercises when API key is unconfigured or offline.
   */
  private getFallbackExercises(params: BrowseExercisesParams): BrowseExercisesResult {
    const {
      search,
      muscle,
      equipment,
      difficulty,
      page = 1,
      limit = 20,
    } = params;

    let list = [...FALLBACK_EXERCISES];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.targetMuscles.some(m => m.toLowerCase().includes(q)) ||
        e.equipment.toLowerCase().includes(q)
      );
    }

    if (muscle && muscle !== 'All') {
      const m = muscle.toLowerCase();
      list = list.filter(e =>
        e.muscleGroups.some(g => g.toLowerCase().includes(m)) ||
        e.targetMuscles.some(t => t.toLowerCase().includes(m))
      );
    }

    if (equipment && equipment !== 'All') {
      const eq = equipment.toLowerCase();
      list = list.filter(e => e.equipment.toLowerCase().includes(eq));
    }

    if (difficulty && difficulty !== 'All') {
      const d = difficulty.toLowerCase();
      list = list.filter(e => e.difficulty.toLowerCase() === d);
    }

    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      exercises: paginated,
      total: list.length,
      page,
      limit,
      hasMore: startIndex + limit < list.length,
      provider: 'LocalFallback',
      isFallback: true,
    };
  }
}
