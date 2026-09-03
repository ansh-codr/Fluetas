'use client';

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import {
  logMeal,
  updateMeal as updateMealService,
  deleteMeal as deleteMealService,
  getWeeklyNutrition,
  MealType,
  MealItem,
  MealEntry,
  NutritionalProfile,
  DayNutrition,
} from '@/lib/services/nutritionService';
import { calculateDailyNutrition } from '@/lib/nutrition/calculator';

interface UseNutritionResult {
  meals: MealEntry[];
  totals: NutritionalProfile;
  weeklyData: DayNutrition[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  addMeal: (data: {
    mealType: MealType;
    date?: string;
    time?: string;
    items: MealItem[];
    notes?: string;
  }) => Promise<void>;
  updateMeal: (
    mealId: string,
    data: {
      mealType: MealType;
      date?: string;
      time?: string;
      items: MealItem[];
      notes?: string;
    }
  ) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  reload: () => void;
}

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export function useNutrition(): UseNutritionResult {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayNutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const totals: NutritionalProfile = calculateDailyNutrition(meals);

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
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MealEntry));
        items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
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
      date?: string;
      time?: string;
      items: MealItem[];
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
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user]
  );

  const updateMeal = useCallback(
    async (
      mealId: string,
      data: {
        mealType: MealType;
        date?: string;
        time?: string;
        items: MealItem[];
        notes?: string;
      }
    ) => {
      if (!user) return;
      setSubmitting(true);
      setError(null);
      try {
        await updateMealService(user.uid, mealId, data);
        getWeeklyNutrition(user.uid).then(res => setWeeklyData(res || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update meal.');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user]
  );

  const deleteMeal = useCallback(
    async (mealId: string) => {
      if (!user) return;
      setSubmitting(true);
      setError(null);
      try {
        await deleteMealService(user.uid, mealId);
        getWeeklyNutrition(user.uid).then(res => setWeeklyData(res || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete meal.');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user]
  );

  return {
    meals,
    totals,
    weeklyData,
    loading,
    error,
    submitting,
    addMeal,
    updateMeal,
    deleteMeal,
    reload,
  };
}
