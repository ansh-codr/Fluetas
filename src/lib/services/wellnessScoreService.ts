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
  const [hydrEntries, sleepEntry, meals, workoutSessions, healthProfile] = await Promise.all([
    getTodayHydrationEntries(userId),
    getLatestSleepEntry(userId),
    getTodayMeals(userId),
    getTodayWorkoutSessions(userId),
    getHealthProfile(userId),
  ]);

  const hydrationTargetMl = (healthProfile?.hydrationTargetL ?? 2.5) * 1000;
  const sleepTargetHrs = healthProfile?.sleepTargetHrs ?? 8;

  let dataPointCount = 0;
  const components: WellnessComponent[] = [];

  // ── Hydration Score ──
  const totalHydrationMl = hydrEntries.reduce((acc, e) => acc + e.amount, 0);
  let hydrationScore: number | null = null;
  if (hydrEntries.length > 0) {
    dataPointCount++;
    const pct = totalHydrationMl / hydrationTargetMl;
    hydrationScore = Math.min(100, Math.round(pct * 100));
    components.push({
      label: 'Hydration',
      score: hydrationScore,
      color: '#38BDF8',
      emoji: '💧',
      status: hydrationScore >= 80 ? 'Great' : hydrationScore >= 50 ? 'Needs Work' : 'Low',
      subtext: `${(totalHydrationMl / 1000).toFixed(1)}L / ${(hydrationTargetMl / 1000).toFixed(1)}L`,
    });
  } else {
    components.push({
      label: 'Hydration', score: null, color: '#38BDF8', emoji: '💧',
      status: 'No data', subtext: 'Log water intake',
    });
  }

  // ── Sleep Score ──
  let sleepScore: number | null = null;
  if (sleepEntry) {
    dataPointCount++;
    const durationScore = Math.min(100, Math.round((sleepEntry.durationHrs / sleepTargetHrs) * 80));
    const qualityBonus = sleepEntry.quality ? Math.round((sleepEntry.quality / 10) * 20) : 10;
    sleepScore = Math.min(100, durationScore + qualityBonus);
    components.push({
      label: 'Sleep',
      score: sleepScore,
      color: '#A78BFA',
      emoji: '🌙',
      status: sleepScore >= 80 ? 'Optimal' : sleepScore >= 60 ? 'Good' : 'Poor',
      subtext: `${sleepEntry.durationHrs}h logged`,
    });
  } else {
    components.push({
      label: 'Sleep', score: null, color: '#A78BFA', emoji: '🌙',
      status: 'No data', subtext: 'Log last night\'s sleep',
    });
  }

  // ── Nutrition Score ──
  let nutritionScore: number | null = null;
  if (meals.length > 0) {
    dataPointCount++;
    const totalCalories = meals.reduce((acc, m) => acc + (m.calories ?? 0), 0);
    // Score based on number of meals logged (simple proxy for compliance)
    const mealsScore = Math.min(100, Math.round((meals.length / 4) * 70));
    const calorieBonus = totalCalories > 0 ? 30 : 0;
    nutritionScore = Math.min(100, mealsScore + calorieBonus);
    components.push({
      label: 'Nutrition',
      score: nutritionScore,
      color: '#22C55E',
      emoji: '🥗',
      status: meals.length >= 3 ? 'On Track' : 'Partial',
      subtext: `${meals.length} meal${meals.length !== 1 ? 's' : ''} logged`,
    });
  } else {
    components.push({
      label: 'Nutrition', score: null, color: '#22C55E', emoji: '🥗',
      status: 'No data', subtext: 'Log your first meal',
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
      trainingScore = 20; // Session started but not completed
    }
    components.push({
      label: 'Training',
      score: trainingScore,
      color: '#FB923C',
      emoji: '🏋️',
      status: trainingScore >= 80 ? 'Completed' : 'In Progress',
      subtext: completedWorkouts.length > 0 ? completedWorkouts[0].workoutName : 'Session active',
    });
  } else {
    components.push({
      label: 'Training', score: null, color: '#FB923C', emoji: '🏋️',
      status: 'No data', subtext: 'Start a workout',
    });
  }

  // ── Overall Score ──
  const scoredComponents = components.filter(c => c.score !== null);
  const insufficientData = scoredComponents.length < 2;

  let overallScore: number | null = null;
  if (!insufficientData) {
    const sum = scoredComponents.reduce((acc, c) => acc + c.score!, 0);
    overallScore = Math.round(sum / scoredComponents.length);
  }

  // Add overall wellness ring
  components.unshift({
    label: 'Wellness Score',
    score: overallScore,
    color: '#F472B6',
    emoji: '❤️',
    status: overallScore
      ? overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Attention'
      : 'Not enough data',
    subtext: overallScore
      ? `Based on ${scoredComponents.length} data points`
      : 'Log activity to generate',
  });

  return {
    overallScore,
    components,
    dataPointCount,
    calculatedAt: new Date(),
    insufficientData,
  };
}
