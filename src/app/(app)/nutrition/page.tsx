'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CircleProgress from '@/components/ui/CircleProgress';
import ProgressBar from '@/components/ui/ProgressBar';
import MealLoggerModal from '@/components/nutrition/MealLoggerModal';
import { useNutrition } from '@/hooks/useNutrition';
import { useUserProfile } from '@/context/UserProfileContext';
import { useAuth } from '@/context/AuthContext';
import { MealEntry } from '@/lib/nutrition/types';
import {
  Utensils,
  Plus,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Pencil,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
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
  build_muscle: 2400,
  lose_weight: 1800,
  strength: 2500,
  endurance: 2600,
  general_fitness: 2000,
  mobility: 1900,
  'Build Muscle': 2400,
  'Lose Weight': 1800,
  'Improve Fitness': 2000,
  'Better Health': 2000,
  'Stress Management': 1900,
  'Sports Performance': 2600,
};

function dayLabel(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return dateStr;
  }
}

export default function NutritionPage() {
  const { user } = useAuth();
  const { healthProfile } = useUserProfile();
  const {
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
  } = useNutrition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Expanded meal rows in list
  const [expandedMealIds, setExpandedMealIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMealIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasPersonalizedTarget = Boolean(healthProfile?.primaryGoal);
  const calorieTarget = healthProfile?.primaryGoal
    ? (CALORIE_TARGETS[healthProfile.primaryGoal] ?? 2000)
    : null;

  const proteinTarget = calorieTarget ? Math.round((calorieTarget * 0.25) / 4) : null;
  const carbsTarget = calorieTarget ? Math.round((calorieTarget * 0.45) / 4) : null;
  const fatTarget = calorieTarget ? Math.round((calorieTarget * 0.3) / 9) : null;

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
    { name: 'Dietary Fiber', current: totals.fiber || 0, target: 30, unit: 'g', color: '#7A4E9E' },
  ];

  const handleOpenNewMeal = () => {
    setEditingMeal(null);
    setModalOpen(true);
  };

  const handleOpenEditMeal = (meal: MealEntry) => {
    setEditingMeal(meal);
    setModalOpen(true);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal entry? Daily totals will be updated automatically.')) {
      return;
    }
    setDeletingId(mealId);
    try {
      await deleteMeal(mealId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveMealData = async (mealData: any) => {
    if (editingMeal) {
      await updateMeal(editingMeal.id, mealData);
    } else {
      await addMeal(mealData);
    }
  };

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
            Real food library, portion calibration, and automated macro arithmetic.
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
            onClick={handleOpenNewMeal}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold cursor-pointer shadow-xs"
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
              <strong>Personalized Targets:</strong> Complete your health profile to unlock personalized caloric and macronutrient targets.
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
          <span className="section-title">TODAY&apos;S METABOLIC BREAKDOWN</span>
          <span className="text-xs text-[#2E7D32] font-semibold">
            {totals.calories} {calorieTarget ? `/ ${calorieTarget} kcal (${caloriePct}%)` : 'kcal logged today'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[#F2F4EE] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : totals.calories === 0 ? (
          <div className="py-10 text-center bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.06)]">
            <p className="text-4xl mb-2">🥗</p>
            <p className="font-bold text-[#12160F] text-sm m-0">No meals logged yet today</p>
            <p className="text-[#586151] text-xs m-0 mt-1 max-w-sm mx-auto">
              Select verified items from our Indian &amp; Global food library to automatically calculate macros.
            </p>
            <button
              onClick={handleOpenNewMeal}
              className="btn-primary mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <Plus size={14} /> Log First Meal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {macros.map(macro => {
              const pct = macro.target ? Math.round((macro.current / macro.target) * 100) : 0;
              return (
                <div
                  key={macro.name}
                  className="p-3.5 rounded-xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-['Outfit'] font-bold text-xs text-[#12160F] m-0">{macro.name}</p>
                    <span className="text-[0.68rem] font-bold" style={{ color: macro.color }}>
                      {macro.current}{macro.unit}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[0.65rem] text-[#586151] m-0 mb-1">
                      {macro.target ? `Target: ${macro.target}${macro.unit}` : 'Logged'}
                    </p>
                    {macro.target ? (
                      <ProgressBar value={Math.min(100, pct)} color={macro.color} height={4} />
                    ) : (
                      <div className="h-1 bg-[rgba(18,22,15,0.08)] rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logged Meals List */}
      <div className="fluetas-card p-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="section-title">LOGGED MEALS TODAY ({meals.length})</span>
          <span className="text-xs text-[#586151]">
            {totals.protein}g protein · {totals.carbs}g carbs · {totals.fat}g fat
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-[#F2F4EE] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#586151]">
            <span>No meal records for today. Tap &quot;Log Meal&quot; to begin.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map(meal => {
              const isExpanded = expandedMealIds[meal.id] ?? false;
              const hasItems = meal.items && meal.items.length > 0;

              return (
                <div
                  key={meal.id}
                  className="bg-[#F2F4EE] border border-[rgba(18,22,15,0.06)] rounded-xl overflow-hidden transition-all"
                >
                  {/* Summary Bar */}
                  <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Outfit'] font-bold text-sm text-[#12160F]">
                          {meal.mealType}
                        </span>
                        {meal.time && (
                          <span className="text-[0.68rem] text-[#586151] flex items-center gap-1">
                            <Clock size={11} />
                            {meal.time}
                          </span>
                        )}
                        <span className="text-[0.68rem] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded">
                          {meal.calories} kcal
                        </span>
                      </div>

                      <p className="text-xs text-[#586151] m-0 mt-1">
                        {hasItems
                          ? meal.items.map(i => `${i.quantity}x ${i.foodNameSnapshot}`).join(', ')
                          : meal.foodItems?.join(', ') || 'No item details'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="flex items-center gap-2.5 text-[0.7rem] text-[#586151]">
                        <span>P: <strong className="text-[#12160F]">{meal.macros?.protein ?? 0}g</strong></span>
                        <span>C: <strong className="text-[#12160F]">{meal.macros?.carbs ?? 0}g</strong></span>
                        <span>F: <strong className="text-[#12160F]">{meal.macros?.fat ?? 0}g</strong></span>
                      </div>

                      <div className="flex items-center gap-1 border-l border-[rgba(18,22,15,0.10)] pl-2.5">
                        {hasItems && (
                          <button
                            onClick={() => toggleExpand(meal.id)}
                            className="p-1.5 rounded-lg text-[#586151] hover:text-[#12160F] hover:bg-white cursor-pointer"
                            title="Expand food breakdown"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditMeal(meal)}
                          className="p-1.5 rounded-lg text-[#586151] hover:text-[#2E6DA4] hover:bg-white cursor-pointer transition-colors"
                          title="Edit Meal"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          disabled={deletingId === meal.id}
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-1.5 rounded-lg text-[#586151] hover:text-red-600 hover:bg-white cursor-pointer transition-colors"
                          title="Delete Meal"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Item Breakdown */}
                  {isExpanded && hasItems && (
                    <div className="p-3.5 bg-white/70 border-t border-[rgba(18,22,15,0.06)] space-y-2">
                      <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider block">
                        Item Details ({meal.items.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {meal.items.map((item, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-white rounded-lg border border-[rgba(18,22,15,0.06)] text-xs flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-[#12160F] m-0">{item.foodNameSnapshot}</p>
                              <p className="text-[0.65rem] text-[#586151] m-0">
                                {item.quantity}x {item.servingDescription}
                              </p>
                            </div>
                            <div className="text-right text-[0.68rem] text-[#586151]">
                              <strong className="text-[#12160F] block">
                                {item.calculatedNutrition.calories} kcal
                              </strong>
                              <span>
                                {item.calculatedNutrition.protein}g P · {item.calculatedNutrition.carbs}g C
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Full-Size Meal Logger Modal */}
      {user && (
        <MealLoggerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={user.uid}
          onSaveMeal={handleSaveMealData}
          onDeleteMeal={handleDeleteMeal}
          initialMeal={editingMeal}
        />
      )}
    </div>
  );
}
