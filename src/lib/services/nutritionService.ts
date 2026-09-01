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
  if (!db) return [];

  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const q = query(
    collection(db, 'nutritionLogs', userId, 'entries'),
    where('date', 'in', dates)
  );
  const snap = await getDocs(q);

  const totals: Record<string, DayNutrition> = {};
  snap.docs.forEach(d => {
    const entry = d.data() as NutritionEntry;
    if (!totals[entry.date]) totals[entry.date] = { date: entry.date, calories: 0, protein: 0 };
    totals[entry.date].calories += entry.calories ?? 0;
    totals[entry.date].protein += entry.macros?.protein ?? 0;
  });

  return dates.map(date => totals[date] ?? { date, calories: 0, protein: 0 });
}
