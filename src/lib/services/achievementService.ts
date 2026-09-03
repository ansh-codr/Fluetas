/**
 * Production Achievement Engine
 * Computes streaks, XP, level milestones, and unlocked badges deterministically from real Firestore telemetry records.
 * Zero mock XP or fake streaks.
 */

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getUserConsultations } from './consultationService';

export interface ConsistencyStreak {
  title: string;
  days: number;
  subtext: string;
  icon: string;
  color: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  earned: boolean;
  unlockedDate?: string;
  category: 'workout' | 'hydration' | 'sleep' | 'consultation' | 'general';
}

export interface UserAchievementsData {
  level: number;
  levelTitle: string;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  hasActivity: boolean;
  streaks: ConsistencyStreak[];
  badges: BadgeItem[];
}

function calculateConsecutiveDays(datesSet: Set<string>): number {
  if (datesSet.size === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Start streak check from today or yesterday
  let startCheckDate: Date;
  if (datesSet.has(todayStr)) {
    startCheckDate = today;
  } else if (datesSet.has(yesterdayStr)) {
    startCheckDate = yesterday;
  } else {
    return 0; // Streak broken
  }

  let streak = 0;
  const curr = new Date(startCheckDate);

  while (true) {
    const dStr = curr.toISOString().split('T')[0];
    if (datesSet.has(dStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Health Explorer',
  2: 'Consistency Builder',
  3: 'Active Performer',
  4: 'Vitality Optimizer',
  5: 'Metabolic Master',
  6: 'High-Performance Athlete',
  7: 'Metabolic & Athletic Champion',
};

export async function getUserAchievements(userId: string): Promise<UserAchievementsData> {
  if (!db || !userId) {
    return {
      level: 1,
      levelTitle: 'Health Explorer',
      currentXp: 0,
      nextLevelXp: 250,
      totalXp: 0,
      hasActivity: false,
      streaks: [
        { title: 'Workout Streak', days: 0, subtext: 'Complete workouts to build streak', icon: '🏋️', color: '#2E7D32' },
        { title: 'Hydration Target', days: 0, subtext: 'Hit 2.5L daily target', icon: '💧', color: '#2E6DA4' },
        { title: 'Sleep Consistency', days: 0, subtext: 'Log daily sleep quality', icon: '🌙', color: '#7A4E9E' },
      ],
      badges: [],
    };
  }

  try {
    const [workoutSnap, hydrSnap, sleepSnap, consults] = await Promise.all([
      getDocs(collection(db, 'workoutLogs', userId, 'entries')),
      getDocs(collection(db, 'hydrationLogs', userId, 'entries')),
      getDocs(collection(db, 'sleepLogs', userId, 'entries')),
      getUserConsultations(userId),
    ]);

    // 1. Process Workout Records
    const workoutDates = new Set<string>();
    let completedWorkoutsCount = 0;
    workoutSnap.forEach(d => {
      const data = d.data();
      if (data.status === 'completed') {
        completedWorkoutsCount++;
        if (data.date) workoutDates.add(data.date);
      }
    });

    // 2. Process Hydration Records
    const dailyHydrMl: Record<string, number> = {};
    hydrSnap.forEach(d => {
      const data = d.data();
      if (data.date && data.amount) {
        dailyHydrMl[data.date] = (dailyHydrMl[data.date] || 0) + Number(data.amount);
      }
    });
    const hydrMetDates = new Set<string>();
    Object.entries(dailyHydrMl).forEach(([dt, ml]) => {
      if (ml >= 2000) hydrMetDates.add(dt);
    });

    // 3. Process Sleep Records
    const sleepDates = new Set<string>();
    sleepSnap.forEach(d => {
      const data = d.data();
      if (data.date && Number(data.durationHrs) > 0) {
        sleepDates.add(data.date);
      }
    });

    // 4. Completed consultations
    const completedConsultsCount = consults.filter(c =>
      ['Completed', 'Report Generated'].includes(c.status)
    ).length;

    // 5. Streaks
    const workoutStreak = calculateConsecutiveDays(workoutDates);
    const hydrationStreak = calculateConsecutiveDays(hydrMetDates);
    const sleepStreak = calculateConsecutiveDays(sleepDates);

    // 6. Calculate Real XP
    const workoutXp = completedWorkoutsCount * 50;
    const hydrXp = Object.keys(dailyHydrMl).length * 20;
    const sleepXp = sleepDates.size * 20;
    const consultXp = completedConsultsCount * 100;
    const totalXp = workoutXp + hydrXp + sleepXp + consultXp;

    const XP_PER_LEVEL = 250;
    const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
    const currentXp = totalXp % XP_PER_LEVEL;
    const levelTitle = LEVEL_TITLES[Math.min(level, 7)] || 'Elite Health Master';
    const hasActivity = totalXp > 0;

    // 7. Define & Evaluate Badges
    const badges: BadgeItem[] = [
      {
        id: 'first-session',
        name: 'First Step',
        desc: 'Complete your first structured workout session',
        icon: '👟',
        color: '#2E7D32',
        earned: completedWorkoutsCount >= 1,
        category: 'workout',
      },
      {
        id: 'hydration-starter',
        name: 'Hydration Habit',
        desc: 'Meet daily hydration target 3 days in a row',
        icon: '💧',
        color: '#2E6DA4',
        earned: hydrationStreak >= 3,
        category: 'hydration',
      },
      {
        id: 'sleep-keeper',
        name: 'Rest Master',
        desc: 'Log nightly sleep for 3 consecutive days',
        icon: '🌙',
        color: '#7A4E9E',
        earned: sleepStreak >= 3,
        category: 'sleep',
      },
      {
        id: 'consistency-warrior',
        name: 'Iron Consistency',
        desc: 'Maintain a 5-day continuous workout streak',
        icon: '🔥',
        color: '#D97706',
        earned: workoutStreak >= 5,
        category: 'workout',
      },
      {
        id: 'clinical-alignment',
        name: 'Clinical Guidance',
        desc: 'Complete an authorized specialist consultation',
        icon: '🩺',
        color: '#38BDF8',
        earned: completedConsultsCount >= 1,
        category: 'consultation',
      },
      {
        id: 'ten-workouts',
        name: 'Century Lifter',
        desc: 'Complete 10 real workout sessions on FLUETAS',
        icon: '🏆',
        color: '#2E7D32',
        earned: completedWorkoutsCount >= 10,
        category: 'workout',
      },
    ];

    const streaks: ConsistencyStreak[] = [
      {
        title: 'Workout Streak',
        days: workoutStreak,
        subtext: workoutStreak > 0 ? 'Consecutive training days' : 'Log a workout today',
        icon: '🏋️',
        color: '#2E7D32',
      },
      {
        title: 'Hydration Target',
        days: hydrationStreak,
        subtext: hydrationStreak > 0 ? 'Daily goal consistency' : 'Drink 2.5L to start',
        icon: '💧',
        color: '#2E6DA4',
      },
      {
        title: 'Sleep Consistency',
        days: sleepStreak,
        subtext: sleepStreak > 0 ? 'Consistent rest schedule' : 'Log tonight\'s sleep',
        icon: '🌙',
        color: '#7A4E9E',
      },
    ];

    return {
      level,
      levelTitle,
      currentXp,
      nextLevelXp: XP_PER_LEVEL,
      totalXp,
      hasActivity,
      streaks,
      badges,
    };
  } catch (err) {
    console.warn('[AchievementService] getUserAchievements error:', err);
    return {
      level: 1,
      levelTitle: 'Health Explorer',
      currentXp: 0,
      nextLevelXp: 250,
      totalXp: 0,
      hasActivity: false,
      streaks: [
        { title: 'Workout Streak', days: 0, subtext: 'Complete workouts to build streak', icon: '🏋️', color: '#2E7D32' },
        { title: 'Hydration Target', days: 0, subtext: 'Hit 2.5L daily target', icon: '💧', color: '#2E6DA4' },
        { title: 'Sleep Consistency', days: 0, subtext: 'Log daily sleep quality', icon: '🌙', color: '#7A4E9E' },
      ],
      badges: [],
    };
  }
}
