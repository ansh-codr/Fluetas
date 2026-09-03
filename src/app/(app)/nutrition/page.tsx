'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CircleProgress from '@/components/ui/CircleProgress';
import ProgressBar from '@/components/ui/ProgressBar';
import { useNutrition } from '@/hooks/useNutrition';
import { useUserProfile } from '@/context/UserProfileContext';
import { MealType } from '@/lib/services/nutritionService';
import {
  Utensils,
  Plus,
  TrendingUp,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CALORIE_TARGETS: Record<string, number> = {
  'build_muscle': 2400,
  'lose_weight': 1800,
  'strength': 2500,
  'endurance': 2600,
  'general_fitness': 2000,
  'mobility': 1900,
  'Build Muscle': 2400,
  'Lose Weight': 1800,
  'Improve Fitness': 2000,
  'Better Health': 2000,
  'Stress Management': 1900,
  'Sports Performance': 2600,
};

const MEAL_TYPES: MealType[] = [
  'Breakfast', 'Mid-Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Post-Workout Fuel', 'Other',
];

function dayLabel(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return dateStr;
  }
}

export default function NutritionPage() {
  const { meals, totals, weeklyData, loading, error, submitting, addMeal, reload } = useNutrition();
  const { healthProfile } = useUserProfile();
  const [logMealOpen, setLogMealOpen] = useState(false);

  const hasPersonalizedTarget = Boolean(healthProfile?.primaryGoal);
  const calorieTarget = healthProfile?.primaryGoal
    ? (CALORIE_TARGETS[healthProfile.primaryGoal] ?? 2000)
    : null;

  const proteinTarget = calorieTarget ? Math.round((calorieTarget * 0.25) / 4) : null;
  const carbsTarget = calorieTarget ? Math.round((calorieTarget * 0.45) / 4) : null;
  const fatTarget = calorieTarget ? Math.round((calorieTarget * 0.3) / 9) : null;

  // Form state
  const [mealType, setMealType] = useState<MealType>('Dinner');
  const [foodItems, setFoodItems] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [formError, setFormError] = useState('');

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const items = foodItems.split(',').map(s => s.trim()).filter(Boolean);
    if (!items.length) { setFormError('Please add at least one food item.'); return; }

    await addMeal({
      mealType,
      foodItems: items,
      calories: calories ? Number(calories) : undefined,
      macros: {
        protein: protein ? Number(protein) : undefined,
        carbs: carbs ? Number(carbs) : undefined,
        fat: fats ? Number(fats) : undefined,
      },
    });

    setLogMealOpen(false);
    setFoodItems('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  const caloriePct = calorieTarget
    ? Math.min(100, Math.round((totals.calories / calorieTarget) * 100))
    : 0;

  const weeklyChartData = weeklyData.map(d => ({
    day: dayLabel(d.date),
    calories: d.calories,
    protein: d.protein,
  }));

  const macros = [
    { name: 'Protein', current: totals.protein, target: proteinTarget, unit: 'g', color: '#2E6DA4' },
    { name: 'Carbohydrates', current: totals.carbs, target: carbsTarget, unit: 'g', color: '#2E7D32' },
    { name: 'Fats', current: totals.fat, target: fatTarget, unit: 'g', color: '#D97706' },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 flex items-center gap-1">
              <Utensils size={11} />
              Manual Tracking Telemetry
            </span>
          </div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            NUTRITION &amp; METABOLIC INTAKE
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Macro tracking, micronutrient density, and meal logging.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={reload}
            className="px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.10)] bg-white text-xs text-[#586151] hover:text-[#12160F] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setLogMealOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <Plus size={15} />
            Log Meal
          </button>
        </div>
      </div>

      {/* Error Card */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={reload}
            className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-colors cursor-pointer shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Unconfigured Profile Notice */}
      {!hasPersonalizedTarget && (
        <div className="p-3.5 rounded-xl bg-[#2E7D32]/5 border border-[#2E7D32]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#2E7D32]">
            <Sparkles size={15} className="shrink-0" />
            <span>
              <strong>Personalized Targets:</strong> Complete your health profile to calculate your exact caloric and macronutrient targets.
            </span>
          </div>
          <Link
            href="/onboarding"
            className="px-3 py-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#256628] text-white text-[0.72rem] font-bold no-underline flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>Complete Profile</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Macro Breakdown */}
      <div className="fluetas-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="section-title">TODAY&apos;S MACRO BREAKDOWN</span>
          <span className="text-xs text-[#2E7D32] font-semibold">
            {totals.calories} {calorieTarget ? `/ ${calorieTarget} kcal (${caloriePct}%)` : 'kcal logged'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[#F2F4EE] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : totals.calories === 0 ? (
          <div className="py-8 text-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
            <p className="text-4xl mb-2">🥗</p>
            <p className="font-bold text-[#12160F] text-sm m-0">No meals logged yet today</p>
            <p className="text-[#586151] text-xs m-0 mt-1">Tap &quot;Log Meal&quot; to start tracking your nutrition manually.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {macros.map(macro => {
              const pct = macro.target ? Math.round((macro.current / macro.target) * 100) : 0;
              return (
                <div key={macro.name} className="p-4 rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] flex items-center gap-4">
                  {macro.target ? (
                    <CircleProgress
                      score={macro.current}
                      max={macro.target}
                      size={70}
                      strokeWidth={6}
                      color={macro.color}
                      trackColor="rgba(18,22,15,0.08)"
                      label={`${pct}%`}
                      labelColor="#12160F"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center font-bold text-xs" style={{ color: macro.color }}>
                      {macro.current}g
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-['Outfit'] font-bold text-sm text-[#12160F] m-0">{macro.name}</p>
                    <p className="text-xs text-[#586151] m-0 mt-0.5">
                      {macro.current}{macro.unit} {macro.target ? `of ${macro.target}${macro.unit}` : 'logged'}
                    </p>
                    {macro.target && (
                      <div className="mt-2">
                        <ProgressBar value={Math.min(100, pct)} color={macro.color} height={4} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logged Meals List */}
      <div className="fluetas-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="section-title">LOGGED MEALS TODAY ({meals.length})</span>
          <span className="text-xs text-[#586151]">{totals.protein}g protein logged</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-[#F2F4EE] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#586151]">
            <span>No meals recorded yet. Log your breakfast, lunch, or post-workout meal.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {meals.map((meal, idx) => (
              <div
                key={meal.id || idx}
                className="p-3.5 bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#12160F]">{meal.mealType}</span>
                    {meal.calories ? (
                      <span className="text-[0.68rem] font-semibold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded">
                        {meal.calories} kcal
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[#586151] m-0 mt-0.5">{meal.foodItems.join(', ')}</p>
                </div>

                <div className="flex items-center gap-3 text-[0.72rem] text-[#586151] shrink-0">
                  {meal.macros?.protein ? <span>P: <strong className="text-[#12160F]">{meal.macros.protein}g</strong></span> : null}
                  {meal.macros?.carbs ? <span>C: <strong className="text-[#12160F]">{meal.macros.carbs}g</strong></span> : null}
                  {meal.macros?.fat ? <span>F: <strong className="text-[#12160F]">{meal.macros.fat}g</strong></span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#2E7D32]" />
            <span className="section-title">7-DAY INTAKE TREND</span>
          </div>
          {calorieTarget && (
            <span className="text-xs text-[#586151]">Target: {calorieTarget} kcal / day</span>
          )}
        </div>

        {weeklyChartData.length > 0 ? (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(18,22,15,0.08)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#586151' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#586151' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} kcal`, 'Calories']}
                  contentStyle={{ backgroundColor: '#12160F', color: '#fff', borderRadius: 8, fontSize: 11 }}
                />
                <Bar dataKey="calories" fill="#2E7D32" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-[#586151]">
            <span>Log nutrition across days to populate your weekly trend.</span>
          </div>
        )}
      </div>

      {/* Log Meal Modal */}
      {logMealOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="fluetas-card p-5 sm:p-6 max-w-md w-full bg-white shadow-xl animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(18,22,15,0.08)] pb-3">
              <span className="font-['Outfit'] font-bold text-sm text-[#12160F]">Log Nutrition Entry</span>
              <button onClick={() => setLogMealOpen(false)} className="text-[#586151] hover:text-[#12160F] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddMeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-1">Meal Type *</label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value as MealType)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                >
                  {MEAL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-1">Food Items (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={foodItems}
                  onChange={e => setFoodItems(e.target.value)}
                  placeholder="e.g. 3 Eggs, Sourdough Bread, Avocado"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                    placeholder="kcal"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={e => setProtein(e.target.value)}
                    placeholder="g"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={e => setCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={e => setFats(e.target.value)}
                    placeholder="g"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(18,22,15,0.08)]">
                <button
                  type="button"
                  onClick={() => setLogMealOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] font-bold text-[#586151] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
