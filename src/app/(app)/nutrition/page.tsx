'use client';

import React, { useState } from 'react';
import CircleProgress from '@/components/ui/CircleProgress';
import ProgressBar from '@/components/ui/ProgressBar';
import { mockMealTimeline, mockNutrition } from '@/lib/mock/dashboardData';
import {
  Utensils,
  Plus,
  Flame,
  CheckCircle2,
  TrendingUp,
  X,
  PieChart as PieIcon,
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

const weeklyNutritionData = [
  { day: 'Mon', calories: 1820, target: 2140, protein: 98 },
  { day: 'Tue', calories: 2100, target: 2140, protein: 118 },
  { day: 'Wed', calories: 1950, target: 2140, protein: 104 },
  { day: 'Thu', calories: 1750, target: 2140, protein: 92 },
  { day: 'Fri', calories: 1820, target: 2140, protein: 96 },
  { day: 'Sat', calories: 2250, target: 2140, protein: 125 },
  { day: 'Sun', calories: 1900, target: 2140, protein: 105 },
];

export default function NutritionPage() {
  const [meals, setMeals] = useState(mockMealTimeline);
  const [logMealOpen, setLogMealOpen] = useState(false);

  // Form State
  const [mealType, setMealType] = useState('Dinner');
  const [foodItems, setFoodItems] = useState('');
  const [calories, setCalories] = useState('550');
  const [protein, setProtein] = useState('38');
  const [carbs, setCarbs] = useState('52');
  const [fats, setFats] = useState('16');

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    setMeals([
      ...meals,
      {
        id: `meal-${Date.now()}`,
        mealType: mealType,
        time: 'Just now',
        calories: Number(calories) || 400,
        items: foodItems.split(',').map(s => s.trim()).filter(Boolean),
        macros: {
          p: Number(protein) || 20,
          c: Number(carbs) || 40,
          f: Number(fats) || 10,
        },
      },
    ]);
    setLogMealOpen(false);
    setFoodItems('');
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            DAILY NUTRITION & MACRONUTRIENTS
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

      {/* Macro Rings Overview */}
      <div className="fluetas-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="section-title">TODAY&apos;S MACRO BREAKDOWN</span>
          <span className="text-xs text-[#10B981] font-semibold">
            {mockNutrition.calories} / {mockNutrition.caloriesTarget} kcal (85%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {mockNutrition.macros.map(macro => {
            const pct = Math.round((macro.current / macro.target) * 100);
            return (
              <div
                key={macro.name}
                className="p-4 rounded-xl bg-[#0B0D14] border border-[#1E2133] flex items-center gap-4"
              >
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
                    <ProgressBar value={pct} color={macro.color} height={4} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Calorie & Protein Chart */}
      <div className="fluetas-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#10B981]" />
            <span className="section-title">7-DAY INTAKE TREND (KCAL & PROTEIN)</span>
          </div>
          <span className="text-xs text-[#8B91B0]">Target: 2,140 kcal / day</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyNutritionData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2133" vertical={false} />
              <XAxis dataKey="day" stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B91B0" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#13161F', borderColor: '#1E2133', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="calories" name="Calories (kcal)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Meal Timeline */}
      <div className="flex flex-col gap-3">
        <span className="section-title">TODAY&apos;S MEAL TIMELINE ({meals.length})</span>

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
                  <span className="text-xs font-medium text-[#8B91B0]">({m.time})</span>
                </div>
                <p className="text-xs text-[#8B91B0] m-0 mt-1">
                  {m.items.join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold self-end sm:self-auto">
              <span className="text-[#E8EAF6]">{m.calories} kcal</span>
              <span className="text-[#3B82F6]">P: {m.macros.p}g</span>
              <span className="text-[#22C55E]">C: {m.macros.c}g</span>
              <span className="text-[#F59E0B]">F: {m.macros.f}g</span>
            </div>
          </div>
        ))}
      </div>

      {/* Log Meal Modal */}
      {logMealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setLogMealOpen(false)}
              className="absolute top-4 right-4 text-[#8B91B0] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#E8EAF6] mb-4 font-['Outfit'] flex items-center gap-2">
              <Utensils size={18} className="text-[#22C55E]" />
              Log Meal & Macros
            </h3>

            <form onSubmit={handleAddMeal} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                >
                  <option>Breakfast</option>
                  <option>Mid-Morning Snack</option>
                  <option>Lunch</option>
                  <option>Evening Snack</option>
                  <option>Dinner</option>
                  <option>Post-Workout Fuel</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Food Items (comma separated)</label>
                <input
                  required
                  placeholder="e.g. Grilled salmon, Steamed quinoa, Asparagus"
                  value={foodItems}
                  onChange={e => setFoodItems(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={e => setProtein(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={e => setCarbs(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={e => setFats(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2 text-[#E8EAF6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 justify-center font-bold mt-2"
              >
                Add to Daily Log
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
