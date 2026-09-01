'use client';

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import {
  logMeal,
  getTodayMeals,
  getWeeklyNutrition,
  computeTotals,
  NutritionEntry,
  NutritionTotals,
  MealType,
  DayNutrition,
} from '@/lib/services/nutritionService';

interface UseNutritionResult {
  meals: NutritionEntry[];
  totals: NutritionTotals;
  weeklyData: DayNutrition[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  addMeal: (data: {
    mealType: MealType;
    foodItems: string[];
    calories?: number;
    macros?: { protein?: number; carbs?: number; fat?: number };
    notes?: string;
  }) => Promise<void>;
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export function useNutrition(): UseNutritionResult {
  const { user } = useAuth();
  const [meals, setMeals] = useState<NutritionEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayNutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totals = computeTotals(meals);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }

    const today = todayDateStr();
    const q = query(
      collection(db, 'nutritionLogs', user.uid, 'entries'),
      where('date', '==', today),
      orderBy('timestamp', 'asc')
    );

    const unsub = onSnapshot(q, snap => {
      setMeals(snap.docs.map(d => ({ id: d.id, ...d.data() } as NutritionEntry)));
      setLoading(false);
    }, () => {
      setError('Failed to load nutrition data.');
      setLoading(false);
    });

    getWeeklyNutrition(user.uid).then(setWeeklyData);

    return () => unsub();
  }, [user]);

  const addMeal = useCallback(async (data: {
    mealType: MealType;
    foodItems: string[];
    calories?: number;
    macros?: { protein?: number; carbs?: number; fat?: number };
    notes?: string;
  }) => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await logMeal(user.uid, data);
      getWeeklyNutrition(user.uid).then(setWeeklyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log meal.');
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  return { meals, totals, weeklyData, loading, error, submitting, addMeal };
}
