/**
 * Nutrition Service
 * Persists to /nutritionLogs/{userId}/entries
 */

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTimelineEvent } from './timelineService';

export type MealType =
  | 'Breakfast'
  | 'Mid-Morning Snack'
  | 'Lunch'
  | 'Evening Snack'
  | 'Dinner'
  | 'Post-Workout Fuel'
  | 'Other';

export interface MacroData {
  protein: number; // grams
  carbs: number;
  fat: number;
}

export interface NutritionEntry {
  id?: string;
  userId: string;
  mealType: MealType;
  foodItems: string[];
  calories?: number;
  macros?: MacroData;
  notes?: string;
  timestamp: Timestamp;
  date: string; // YYYY-MM-DD
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export async function logMeal(
  userId: string,
  data: {
    mealType: MealType;
    foodItems: string[];
    calories?: number;
    macros?: Partial<MacroData>;
    notes?: string;
  }
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  if (!data.foodItems.length) throw new Error('Please add at least one food item.');
  if (data.calories !== undefined && (data.calories < 0 || data.calories > 10000)) {
    throw new Error('Calorie value appears invalid (0–10,000 kcal).');
  }

  const entry: Omit<NutritionEntry, 'id'> = {
    userId,
    mealType: data.mealType,
    foodItems: data.foodItems,
    calories: data.calories,
    macros: data.macros
      ? {
          protein: data.macros.protein ?? 0,
          carbs: data.macros.carbs ?? 0,
          fat: data.macros.fat ?? 0,
        }
      : undefined,
    notes: data.notes,
    timestamp: Timestamp.now(),
    date: todayDateStr(),
  };

  const ref = await addDoc(collection(db, 'nutritionLogs', userId, 'entries'), entry);

  await addTimelineEvent(userId, {
    type: 'meal_logged',
    title: 'Meal Logged',
    description: `${data.mealType}${data.calories ? ` · ${data.calories} kcal` : ''}`,
    category: 'Nutrition',
    badge: 'Logged',
    metadata: { mealType: data.mealType, calories: data.calories },
  });

  return ref.id;
}

export async function getTodayMeals(userId: string): Promise<NutritionEntry[]> {
  if (!db) return [];
  const today = todayDateStr();
  const q = query(
    collection(db, 'nutritionLogs', userId, 'entries'),
    where('date', '==', today),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as NutritionEntry));
}

export function computeTotals(meals: NutritionEntry[]): NutritionTotals {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein: acc.protein + (m.macros?.protein ?? 0),
      carbs: acc.carbs + (m.macros?.carbs ?? 0),
      fat: acc.fat + (m.macros?.fat ?? 0),
      mealCount: acc.mealCount + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 }
  );
}

export interface DayNutrition {
  date: string;
  calories: number;
  protein: number;
}

export async function getWeeklyNutrition(userId: string): Promise<DayNutrition[]> {
  const trend = await getNutritionTrend(userId, 7);
  return trend.days.map(d => ({
    date: d.date,
    calories: d.calories,
    protein: d.protein,
  }));
}

export interface NutritionDayTrend {
  date: string;
  dayLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  isLogged: boolean;
}

export interface NutritionTrendSummary {
  days: NutritionDayTrend[];
  avgCalories: number;
  avgProtein: number;
  calorieDelta: number;
  totalCalories: number;
  loggedDaysCount: number;
}

export async function getNutritionTrend(
  userId: string,
  days = 7
): Promise<NutritionTrendSummary> {
  if (!db) {
    return {
      days: [],
      avgCalories: 0,
      avgProtein: 0,
      calorieDelta: 0,
      totalCalories: 0,
      loggedDaysCount: 0,
    };
  }

  const numDays = Math.min(Math.max(days, 1), 30);
  const dates: string[] = [];
  const dateObjs: Date[] = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
    dateObjs.push(d);
  }

  const q = query(
    collection(db, 'nutritionLogs', userId, 'entries'),
    where('date', 'in', dates.slice(0, 30))
  );
  const snap = await getDocs(q);

  const dayMap: Record<string, { calories: number; protein: number; carbs: number; fat: number; mealCount: number }> = {};
  snap.docs.forEach(d => {
    const entry = d.data() as NutritionEntry;
    if (!dayMap[entry.date]) {
      dayMap[entry.date] = { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 };
    }
    dayMap[entry.date].calories += entry.calories ?? 0;
    dayMap[entry.date].protein += entry.macros?.protein ?? 0;
    dayMap[entry.date].carbs += entry.macros?.carbs ?? 0;
    dayMap[entry.date].fat += entry.macros?.fat ?? 0;
    dayMap[entry.date].mealCount += 1;
  });

  const dayTrends: NutritionDayTrend[] = dates.map((date, idx) => {
    const d = dayMap[date];
    const dObj = dateObjs[idx];
    const dayLabel = dObj.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date,
      dayLabel,
      calories: d?.calories ?? 0,
      protein: Math.round(d?.protein ?? 0),
      carbs: Math.round(d?.carbs ?? 0),
      fat: Math.round(d?.fat ?? 0),
      mealCount: d?.mealCount ?? 0,
      isLogged: Boolean(d && d.mealCount > 0),
    };
  });

  const loggedDays = dayTrends.filter(d => d.isLogged);
  const loggedDaysCount = loggedDays.length;
  const totalCalories = dayTrends.reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = dayTrends.reduce((sum, d) => sum + d.protein, 0);

  const avgCalories = loggedDaysCount > 0 ? Math.round(totalCalories / loggedDaysCount) : 0;
  const avgProtein = loggedDaysCount > 0 ? Math.round(totalProtein / loggedDaysCount) : 0;

  // Delta: compare recent half vs prior half
  const half = Math.floor(numDays / 2);
  let calorieDelta = 0;
  if (half > 0) {
    const recentLogged = dayTrends.slice(half).filter(d => d.isLogged);
    const priorLogged = dayTrends.slice(0, half).filter(d => d.isLogged);
    if (recentLogged.length > 0 && priorLogged.length > 0) {
      const recentAvg = recentLogged.reduce((s, d) => s + d.calories, 0) / recentLogged.length;
      const priorAvg = priorLogged.reduce((s, d) => s + d.calories, 0) / priorLogged.length;
      calorieDelta = Math.round(recentAvg - priorAvg);
    }
  }

  return {
    days: dayTrends,
    avgCalories,
    avgProtein,
    calorieDelta,
    totalCalories,
    loggedDaysCount,
  };
}

/** Generic trend function matching standard prompt interface */
export async function getTrend(userId: string, metric = 'calories', days = 7) {
  return getNutritionTrend(userId, days);
}
