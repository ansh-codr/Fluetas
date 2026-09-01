'use client';

import React, { useState } from 'react';
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
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' });
}

export default function NutritionPage() {
  const { meals, totals, weeklyData, loading, error, submitting, addMeal } = useNutrition();
  const { healthProfile } = useUserProfile();
  const [logMealOpen, setLogMealOpen] = useState(false);

  const calorieTarget = healthProfile?.primaryGoal
    ? (CALORIE_TARGETS[healthProfile.primaryGoal] ?? 2000)
    : 2000;
  const proteinTarget = Math.round(calorieTarget * 0.25 / 4);
  const carbsTarget = Math.round(calorieTarget * 0.45 / 4);
  const fatTarget = Math.round(calorieTarget * 0.3 / 9);

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

  const caloriePct = Math.min(100, Math.round((totals.calories / calorieTarget) * 100));
  const weeklyChartData = weeklyData.map(d => ({
    day: dayLabel(d.date),
    calories: d.calories,
    protein: d.protein,
    target: calorieTarget,
  }));

  const macros = [
    { name: 'Protein', current: totals.protein, target: proteinTarget, unit: 'g', color: '#3B82F6' },
    { name: 'Carbohydrates', current: totals.carbs, target: carbsTarget, unit: 'g', color: '#22C55E' },
    { name: 'Fats', current: totals.fat, target: fatTarget, unit: 'g', color: '#F59E0B' },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            DAILY NUTRITION &amp; MACRONUTRIENTS
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Real-time calorie balancing, protein pacing, and micronutrient density.
          </p>
        </div>
        <button
          onClick={() => setLogMealOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          Log Meal
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">{error}</div>
      )}

      {/* Macro Rings */}
      <div className="fluetas-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="section-title">TODAY'S MACRO BREAKDOWN</span>
          <span className="text-xs text-[#10B981] font-semibold">
            {totals.calories} / {calorieTarget} kcal ({caloriePct}%)
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[#1E2133] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : totals.calories === 0 ? (
          <div className="py-8 text-center">
            <p className="text-4xl mb-2">🥗</p>
            <p className="font-semibold text-[#E8EAF6] text-sm m-0">No meals logged yet today</p>
            <p className="text-[#8B91B0] text-xs m-0 mt-1">Tap "Log Meal" to start tracking your nutrition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {macros.map(macro => {
              const pct = Math.round((macro.current / Math.max(1, macro.target)) * 100);
              return (
                <div key={macro.name} className="p-4 rounded-xl bg-[#0B0D14] border border-[#1E2133] flex items-center gap-4">
                  <CircleProgress
                    score={macro.current}
                    max={macro.target}
                    size={70}
                    strokeWidth={6}
                    color={macro.color}
                    trackColor={`${macro.color}20`}
                    label={`${pct}%`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-['Outfit'] font-bold text-sm text-[#E8EAF6] m-0">{macro.name}</p>
                    <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                      {macro.current}{macro.unit} of {macro.target}{macro.unit}
                    </p>
                    <div className="mt-2">
                      <ProgressBar value={Math.min(100, pct)} color={macro.color} height={4} />
                    </div>
                  </div>
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
            <TrendingUp size={16} className="text-[#10B981]" />
            <span className="section-title">7-DAY INTAKE TREND</span>
          </div>
          <span className="text-xs text-[#8B91B0]">Target: {calorieTarget} kcal / day</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" vertical={false} />
              <XAxis dataKey="day" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#13161F', borderColor: '#1E2133', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="calories" name="Calories (kcal)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Meal Timeline */}
      <div className="flex flex-col gap-3">
        <span className="section-title">TODAY'S MEAL TIMELINE ({meals.length})</span>

        {meals.length === 0 && !loading && (
          <div className="fluetas-card p-6 text-center">
            <p className="text-[#3A3F58] text-sm">No meals logged today. Tap "Log Meal" to start.</p>
          </div>
        )}

        {meals.map(m => (
          <div
            key={m.id}
            className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2A3050] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-lg text-[#22C55E] shrink-0">
                <Utensils size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#E8EAF6] m-0">
                    {m.mealType}
                  </h3>
                </div>
                <p className="text-xs text-[#8B91B0] m-0 mt-1">
                  {m.foodItems.join(' · ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold self-end sm:self-auto">
              {m.calories != null && <span className="text-[#E8EAF6]">{m.calories} kcal</span>}
              {m.macros?.protein != null && <span className="text-[#3B82F6]">P: {m.macros.protein}g</span>}
              {m.macros?.carbs != null && <span className="text-[#22C55E]">C: {m.macros.carbs}g</span>}
              {m.macros?.fat != null && <span className="text-[#F59E0B]">F: {m.macros.fat}g</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Log Meal Modal */}
      {logMealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto">
            <button onClick={() => setLogMealOpen(false)} className="absolute top-4 right-4 text-[#8B91B0] hover:text-white cursor-pointer">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-[#E8EAF6] mb-4 font-['Outfit'] flex items-center gap-2">
              <Utensils size={18} className="text-[#22C55E]" />
              Log Meal &amp; Macros
            </h3>
            <form onSubmit={handleAddMeal} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value as MealType)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6] focus:border-[#22C55E] focus:outline-none"
                >
                  {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Food Items <span className="text-[#3A3F58]">(comma separated)</span></label>
                <input
                  required
                  placeholder="e.g. Grilled salmon, Steamed quinoa, Asparagus"
                  value={foodItems}
                  onChange={e => setFoodItems(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6] focus:border-[#22C55E] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Calories', value: calories, setter: setCalories, placeholder: 'kcal' },
                  { label: 'Protein (g)', value: protein, setter: setProtein, placeholder: 'g' },
                  { label: 'Carbs (g)', value: carbs, setter: setCarbs, placeholder: 'g' },
                  { label: 'Fats (g)', value: fats, setter: setFats, placeholder: 'g' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[#8B91B0] font-semibold mb-1">{f.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={f.value}
                      onChange={e => f.setter(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6] focus:border-[#22C55E] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              {(formError || error) && (
                <p className="text-red-400 text-[0.7rem]">{formError || error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-2.5 justify-center font-bold mt-2 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {submitting ? 'Adding...' : 'Add to Daily Log'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
