/**
 * Nutrition Service
 * Real data-driven multi-item meal persistence to /nutritionLogs/{userId}/entries
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTimelineEvent } from './timelineService';
import {
  MealType,
  MealItem,
  MealEntry,
  NutritionalProfile,
} from '../nutrition/types';
import { calculateMealTotals, roundCalories, roundMacro } from '../nutrition/calculator';

export { type MealType, type MealItem, type MealEntry, type NutritionalProfile };

export interface DayNutrition {
  date: string;
  calories: number;
  protein: number;
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

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

function currentTimeStr(): string {
  const now = new Date();
  return now.toTimeString().substring(0, 5); // HH:mm
}

/**
 * Creates and logs a structured multi-item meal entry.
 */
export async function logMeal(
  userId: string,
  data: {
    mealType: MealType;
    date?: string;
    time?: string;
    items: MealItem[];
    notes?: string;
  }
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  if (!userId) throw new Error('User ID is required');
  if (!data.items || data.items.length === 0) {
    throw new Error('A meal must contain at least one food item.');
  }

  const mealDate = data.date || todayDateStr();
  const mealTime = data.time || currentTimeStr();
  const totals = calculateMealTotals(data.items);

  const entry: Omit<MealEntry, 'id'> = {
    userId,
    mealType: data.mealType,
    date: mealDate,
    time: mealTime,
    items: data.items,
    foodItems: data.items.map(i => `${i.quantity}x ${i.foodNameSnapshot}`),
    calories: totals.calories,
    macros: {
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    },
    fiber: totals.fiber,
    totals,
    notes: data.notes?.trim() || '',
    timestamp: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const ref = await addDoc(collection(db, 'nutritionLogs', userId, 'entries'), entry);

  await addTimelineEvent(userId, {
    type: 'meal_logged',
    title: `${data.mealType} Logged`,
    description: `${data.items.length} item(s) · ${totals.calories} kcal · ${totals.protein}g protein`,
    category: 'Nutrition',
    badge: 'Logged',
    metadata: { mealType: data.mealType, calories: totals.calories },
  });

  return ref.id;
}

/**
 * Updates an existing meal entry and recalculates totals.
 */
export async function updateMeal(
  userId: string,
  mealId: string,
  data: {
    mealType: MealType;
    date?: string;
    time?: string;
    items: MealItem[];
    notes?: string;
  }
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  if (!userId || !mealId) throw new Error('User ID and Meal ID required');
  if (!data.items || data.items.length === 0) {
    throw new Error('A meal must contain at least one food item.');
  }

  const totals = calculateMealTotals(data.items);
  const ref = doc(db, 'nutritionLogs', userId, 'entries', mealId);

  await setDoc(
    ref,
    {
      mealType: data.mealType,
      date: data.date || todayDateStr(),
      time: data.time || currentTimeStr(),
      items: data.items,
      foodItems: data.items.map(i => `${i.quantity}x ${i.foodNameSnapshot}`),
      calories: totals.calories,
      macros: {
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
      },
      fiber: totals.fiber,
      totals,
      notes: data.notes?.trim() || '',
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

/**
 * Deletes a meal entry.
 */
export async function deleteMeal(userId: string, mealId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  if (!userId || !mealId) return;
  await deleteDoc(doc(db, 'nutritionLogs', userId, 'entries', mealId));
}

/**
 * Fetches meals for today.
 */
export async function getTodayMeals(userId: string): Promise<MealEntry[]> {
  if (!db || !userId) return [];
  try {
    const today = todayDateStr();
    const q = query(
      collection(db, 'nutritionLogs', userId, 'entries'),
      where('date', '==', today)
    );
    const snap = await getDocs(q);
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() } as MealEntry));
    return entries.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  } catch (err) {
    console.warn('[NutritionService] getTodayMeals failed:', err);
    return [];
  }
}

/**
 * Aggregates daily nutrition for 7-day trend.
 */
export async function getWeeklyNutrition(userId: string): Promise<DayNutrition[]> {
  const trend = await getNutritionTrend(userId, 7);
  return trend.days.map(d => ({
    date: d.date,
    calories: d.calories,
    protein: d.protein,
  }));
}

/**
 * Computes 7-day or 30-day nutrition trends from real persisted meals.
 */
export async function getNutritionTrend(
  userId: string,
  days = 7
): Promise<NutritionTrendSummary> {
  if (!db || !userId) {
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
    const entry = d.data() as MealEntry;
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
      calories: Math.round(d?.calories ?? 0),
      protein: roundMacro(d?.protein ?? 0),
      carbs: roundMacro(d?.carbs ?? 0),
      fat: roundMacro(d?.fat ?? 0),
      mealCount: d?.mealCount ?? 0,
      isLogged: Boolean(d && d.mealCount > 0),
    };
  });

  const loggedDays = dayTrends.filter(d => d.isLogged);
  const loggedDaysCount = loggedDays.length;
  const totalCalories = dayTrends.reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = dayTrends.reduce((sum, d) => sum + d.protein, 0);

  const avgCalories = loggedDaysCount > 0 ? Math.round(totalCalories / loggedDaysCount) : 0;
  const avgProtein = loggedDaysCount > 0 ? roundMacro(totalProtein / loggedDaysCount) : 0;

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
