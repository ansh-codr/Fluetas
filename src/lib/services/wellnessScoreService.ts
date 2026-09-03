/**
 * Wellness Score Service
 * Calculates a transparent, data-driven wellness score from today's real records.
 * Never manufactures a score — returns null if insufficient data exists.
 */

import { getTodayHydrationEntries } from './hydrationService';
import { getLatestSleepEntry } from './sleepService';
import { getTodayMeals } from './nutritionService';
import { getTodayWorkoutSessions } from './workoutService';
import { getHealthProfile } from './userService';

export interface WellnessComponent {
  label: string;
  score: number | null;  // null = no data
  color: string;
  emoji: string;
  status: string;
  subtext: string;
}

export interface WellnessScoreResult {
  overallScore: number | null;
  components: WellnessComponent[];
  dataPointCount: number;
  calculatedAt: Date;
  insufficientData: boolean;
}

export async function calculateWellnessScore(userId: string): Promise<WellnessScoreResult> {
  try {
    const results = await Promise.allSettled([
      getTodayHydrationEntries(userId),
      getLatestSleepEntry(userId),
      getTodayMeals(userId),
      getTodayWorkoutSessions(userId),
      getHealthProfile(userId),
    ]);

    const hydrEntries = results[0].status === 'fulfilled' ? results[0].value : [];
    const sleepEntry = results[1].status === 'fulfilled' ? results[1].value : null;
    const meals = results[2].status === 'fulfilled' ? results[2].value : [];
    const workoutSessions = results[3].status === 'fulfilled' ? results[3].value : [];
    const healthProfile = results[4].status === 'fulfilled' ? results[4].value : null;

    const hydrationTargetMl = (healthProfile?.hydrationTargetL ?? 2.5) * 1000;
    const sleepTargetHrs = healthProfile?.sleepTargetHrs ?? 8;

    let dataPointCount = 0;
    const components: WellnessComponent[] = [];

    // ── Hydration Score ──
    const totalHydrationMl = hydrEntries.reduce((acc, e) => acc + (e.amount || 0), 0);
    let hydrationScore: number | null = null;
    if (hydrEntries.length > 0 && totalHydrationMl > 0) {
      dataPointCount++;
      const pct = totalHydrationMl / hydrationTargetMl;
      hydrationScore = Math.min(100, Math.round(pct * 100));
      components.push({
        label: 'Hydration',
        score: hydrationScore,
        color: '#2E6DA4',
        emoji: '💧',
        status: hydrationScore >= 80 ? 'Optimal' : hydrationScore >= 50 ? 'On Track' : 'Low',
        subtext: `${(totalHydrationMl / 1000).toFixed(1)}L / ${(hydrationTargetMl / 1000).toFixed(1)}L`,
      });
    } else {
      components.push({
        label: 'Hydration',
        score: 0,
        color: '#2E6DA4',
        emoji: '💧',
        status: '0L Logged',
        subtext: 'Target 2.5L / day',
      });
    }

    // ── Sleep Score ──
    let sleepScore: number | null = null;
    if (sleepEntry && sleepEntry.durationHrs > 0) {
      dataPointCount++;
      const durationScore = Math.min(100, Math.round((sleepEntry.durationHrs / sleepTargetHrs) * 80));
      const qualityBonus = sleepEntry.quality ? Math.round((sleepEntry.quality / 10) * 20) : 10;
      sleepScore = Math.min(100, durationScore + qualityBonus);
      components.push({
        label: 'Sleep',
        score: sleepScore,
        color: '#7A4E9E',
        emoji: '🌙',
        status: sleepScore >= 80 ? 'Optimal' : sleepScore >= 60 ? 'Good' : 'Needs Rest',
        subtext: `${sleepEntry.durationHrs}h logged`,
      });
    } else {
      components.push({
        label: 'Sleep',
        score: 0,
        color: '#7A4E9E',
        emoji: '🌙',
        status: 'No sleep logged',
        subtext: 'Target 8.0h / night',
      });
    }

    // ── Nutrition Score ──
    let nutritionScore: number | null = null;
    if (meals.length > 0) {
      dataPointCount++;
      const totalCalories = meals.reduce((acc, m) => acc + (m.calories ?? 0), 0);
      const mealsScore = Math.min(100, Math.round((meals.length / 3) * 70));
      const calorieBonus = totalCalories > 0 ? 30 : 0;
      nutritionScore = Math.min(100, mealsScore + calorieBonus);
      components.push({
        label: 'Nutrition',
        score: nutritionScore,
        color: '#2E7D32',
        emoji: '🥗',
        status: meals.length >= 3 ? 'On Track' : 'Partial',
        subtext: `${meals.length} meal${meals.length !== 1 ? 's' : ''} (${totalCalories} kcal)`,
      });
    } else {
      components.push({
        label: 'Nutrition',
        score: 0,
        color: '#2E7D32',
        emoji: '🥗',
        status: '0 meals logged',
        subtext: 'Log breakfast, lunch, or dinner',
      });
    }

    // ── Training Score ──
    const completedWorkouts = workoutSessions.filter(s => s.status === 'completed');
    let trainingScore: number | null = null;
    if (workoutSessions.length > 0) {
      dataPointCount++;
      if (completedWorkouts.length > 0) {
        const session = completedWorkouts[0];
        const completionRate = session.totalSets
          ? Math.round((session.completedSets! / session.totalSets) * 100)
          : 100;
        trainingScore = Math.min(100, completionRate);
      } else {
        trainingScore = 30; // Active session
      }
      components.push({
        label: 'Training',
        score: trainingScore,
        color: '#2E7D32',
        emoji: '🏋️',
        status: trainingScore >= 80 ? 'Completed' : 'In Progress',
        subtext: completedWorkouts.length > 0 ? (completedWorkouts[0].workoutName || 'Workout done') : 'Session active',
      });
    } else {
      components.push({
        label: 'Training',
        score: 0,
        color: '#2E7D32',
        emoji: '🏋️',
        status: 'No session yet',
        subtext: 'Start scheduled routine',
      });
    }

    // ── Overall Wellness Score ──
    const scoredComponents = components.filter(c => c.score !== null && c.score > 0);
    const insufficientData = scoredComponents.length === 0;

    let overallScore: number | null = null;
    if (!insufficientData) {
      const sum = scoredComponents.reduce((acc, c) => acc + c.score!, 0);
      overallScore = Math.round(sum / 4); // Normalized out of 4 pillar averages
    }

    // Add overall wellness ring as first component
    components.unshift({
      label: 'Overall Wellness',
      score: overallScore ?? 0,
      color: '#2E7D32',
      emoji: '⚡',
      status: overallScore
        ? overallScore >= 80 ? 'Optimal' : overallScore >= 50 ? 'Balanced' : 'Building'
        : 'Getting Started',
      subtext: overallScore
        ? `${scoredComponents.length}/4 telemetry pillars active`
        : 'Log telemetry to unlock score',
    });

    return {
      overallScore,
      components,
      dataPointCount,
      calculatedAt: new Date(),
      insufficientData,
    };
  } catch (err) {
    console.warn('[WellnessScoreService] calculation fallback:', err);
    return {
      overallScore: 0,
      components: [
        { label: 'Overall Wellness', score: 0, color: '#2E7D32', emoji: '⚡', status: 'Getting Started', subtext: 'Log telemetry to unlock score' },
        { label: 'Hydration', score: 0, color: '#2E6DA4', emoji: '💧', status: '0L Logged', subtext: 'Target 2.5L / day' },
        { label: 'Sleep', score: 0, color: '#7A4E9E', emoji: '🌙', status: 'No sleep logged', subtext: 'Target 8.0h / night' },
        { label: 'Nutrition', score: 0, color: '#2E7D32', emoji: '🥗', status: '0 meals logged', subtext: 'Log breakfast, lunch, or dinner' },
        { label: 'Training', score: 0, color: '#2E7D32', emoji: '🏋️', status: 'No session yet', subtext: 'Start scheduled routine' },
      ],
      dataPointCount: 0,
      calculatedAt: new Date(),
      insufficientData: true,
    };
  }
}
