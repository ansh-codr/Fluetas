'use client';

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import {
  logMeal,
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
  reload: () => void;
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
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const totals = computeTotals(meals);

  const reload = useCallback(() => {
    setReloadTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const today = todayDateStr();

    // Query entries for today without compound index requirement
    const q = query(
      collection(db, 'nutritionLogs', user.uid, 'entries'),
      where('date', '==', today)
    );

    const unsub = onSnapshot(
      q,
      snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as NutritionEntry));
        items.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        setMeals(items);
        setError(null);
        setLoading(false);
      },
      err => {
        console.warn('[useNutrition] Snapshot error:', err);
        setError('Unable to load your nutrition records right now.');
        setLoading(false);
      }
    );

    getWeeklyNutrition(user.uid)
      .then(res => setWeeklyData(res || []))
      .catch(() => setWeeklyData([]));

    return () => unsub();
  }, [user, reloadTrigger]);

  const addMeal = useCallback(
    async (data: {
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
        getWeeklyNutrition(user.uid).then(res => setWeeklyData(res || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to log meal.');
      } finally {
        setSubmitting(false);
      }
    },
    [user]
  );

  return { meals, totals, weeklyData, loading, error, submitting, addMeal, reload };
}
