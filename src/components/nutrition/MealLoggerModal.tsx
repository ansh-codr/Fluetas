'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  Calendar,
  Utensils,
  ChevronRight,
  Info,
  ShieldCheck,
  Tag,
  Sliders,
} from 'lucide-react';
import {
  FoodItem,
  MealItem,
  MealType,
  MealEntry,
  DietaryFlag,
  NutritionalProfile,
} from '@/lib/nutrition/types';
import { FOOD_CATEGORIES } from '@/lib/nutrition/foodCatalog';
import {
  searchFoodCatalog,
  saveUserCustomFood,
  getUserCustomFoods,
} from '@/lib/services/foodCatalogService';
import {
  calculateItemNutrition,
  calculateMealTotals,
  validateNutritionOverride,
  roundCalories,
  roundMacro,
} from '@/lib/nutrition/calculator';

interface MealLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSaveMeal: (mealData: {
    mealType: MealType;
    date: string;
    time: string;
    items: MealItem[];
    notes?: string;
  }) => Promise<void>;
  onDeleteMeal?: (mealId: string) => Promise<void>;
  initialMeal?: MealEntry | null;
}

const MEAL_TYPES: MealType[] = [
  'Breakfast',
  'Morning Snack',
  'Lunch',
  'Evening Snack',
  'Dinner',
  'Post Workout',
  'Other',
];

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentTimeStr(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function MealLoggerModal({
  isOpen,
  onClose,
  userId,
  onSaveMeal,
  onDeleteMeal,
  initialMeal,
}: MealLoggerModalProps) {
  // Meal Level State
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [mealDate, setMealDate] = useState<string>(getTodayStr());
  const [mealTime, setMealTime] = useState<string>(getCurrentTimeStr());
  const [mealNotes, setMealNotes] = useState('');
  const [mealItems, setMealItems] = useState<MealItem[]>([]);

  // Search & Catalog State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFlag | 'all'>('all');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);

  // Active Selected Food State (for portion selection before adding)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideCalories, setOverrideCalories] = useState<string>('');
  const [overrideProtein, setOverrideProtein] = useState<string>('');
  const [overrideCarbs, setOverrideCarbs] = useState<string>('');
  const [overrideFat, setOverrideFat] = useState<string>('');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Custom Food Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('other');
  const [customServingDesc, setCustomServingDesc] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customDiet, setCustomDiet] = useState<DietaryFlag>('veg');
  const [customModalError, setCustomModalError] = useState<string | null>(null);
  const [savingCustom, setSavingCustom] = useState(false);

  // Submission State
  const [submittingMeal, setSubmittingMeal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mobile View Tab: 'browse' | 'meal'
  const [mobileTab, setMobileTab] = useState<'browse' | 'meal'>('browse');

  // Initialize or reset when opened
  useEffect(() => {
    if (!isOpen) return;

    if (initialMeal) {
      setMealType(initialMeal.mealType);
      setMealDate(initialMeal.date || getTodayStr());
      setMealTime(initialMeal.time || getCurrentTimeStr());
      setMealNotes(initialMeal.notes || '');
      setMealItems(initialMeal.items || []);
      setMobileTab('meal');
    } else {
      setMealType('Lunch');
      setMealDate(getTodayStr());
      setMealTime(getCurrentTimeStr());
      setMealNotes('');
      setMealItems([]);
      setMobileTab('browse');
    }

    // Load custom foods
    if (userId) {
      getUserCustomFoods(userId).then(setCustomFoods).catch(() => {});
    }
  }, [isOpen, initialMeal, userId]);

  // Execute food search
  useEffect(() => {
    if (!isOpen) return;
    setLoadingCatalog(true);

    const timer = setTimeout(() => {
      searchFoodCatalog(searchQuery, selectedCategory, dietaryFilter, userId)
        .then(res => {
          setSearchResults(res);
          setLoadingCatalog(false);
        })
        .catch(() => {
          setSearchResults([]);
          setLoadingCatalog(false);
        });
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, dietaryFilter, userId, isOpen]);

  // When food is selected, initialize portion
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(1);
    setShowOverride(false);
    setOverrideCalories('');
    setOverrideProtein('');
    setOverrideCarbs('');
    setOverrideFat('');
    setOverrideError(null);
  };

  // Live computed nutrition for currently selected food
  const activeItemNutrition = useMemo(() => {
    if (!selectedFood) return null;

    const overrideObj: Partial<NutritionalProfile> = {};
    if (overrideCalories !== '') overrideObj.calories = Number(overrideCalories);
    if (overrideProtein !== '') overrideObj.protein = Number(overrideProtein);
    if (overrideCarbs !== '') overrideObj.carbs = Number(overrideCarbs);
    if (overrideFat !== '') overrideObj.fat = Number(overrideFat);

    return calculateItemNutrition(selectedFood, quantity, overrideObj);
  }, [selectedFood, quantity, overrideCalories, overrideProtein, overrideCarbs, overrideFat]);

  // Add selected food to current meal
  const handleAddItemToMeal = () => {
    if (!selectedFood || !activeItemNutrition) return;

    // Validate override if modified
    if (showOverride) {
      const overrideObj: Partial<NutritionalProfile> = {};
      if (overrideCalories !== '') overrideObj.calories = Number(overrideCalories);
      if (overrideProtein !== '') overrideObj.protein = Number(overrideProtein);
      if (overrideCarbs !== '') overrideObj.carbs = Number(overrideCarbs);
      if (overrideFat !== '') overrideObj.fat = Number(overrideFat);

      const validation = validateNutritionOverride(selectedFood, quantity, overrideObj);
      if (!validation.valid) {
        setOverrideError(validation.message || 'Adjusted nutrition values fall outside acceptable limits.');
        return;
      }
    }

    const newItem: MealItem = {
      foodId: selectedFood.id,
      foodNameSnapshot: selectedFood.name,
      servingDescription: selectedFood.servingDescription,
      quantity,
      servingUnit: selectedFood.servingUnit,
      nutritionPerServing: selectedFood.baseNutrition,
      nutritionOverride: showOverride
        ? {
            calories: overrideCalories !== '' ? Number(overrideCalories) : undefined,
            protein: overrideProtein !== '' ? Number(overrideProtein) : undefined,
            carbs: overrideCarbs !== '' ? Number(overrideCarbs) : undefined,
            fat: overrideFat !== '' ? Number(overrideFat) : undefined,
          }
        : undefined,
      calculatedNutrition: activeItemNutrition,
      isCustom: selectedFood.isCustom,
      dietaryFlags: selectedFood.dietaryFlags,
    };

    setMealItems(prev => [...prev, newItem]);
    setSelectedFood(null);
    setOverrideError(null);
    setMobileTab('meal');
  };

  // Modify quantity of item in current meal
  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    setMealItems(prev => {
      const updated = [...prev];
      const target = updated[index];
      const baseFood = searchResults.find(f => f.id === target.foodId) || {
        id: target.foodId,
        name: target.foodNameSnapshot,
        categoryId: 'other',
        servingUnit: target.servingUnit,
        servingAmount: 1,
        servingDescription: target.servingDescription,
        baseNutrition: target.nutritionPerServing,
        allowedNutritionRange: {
          calories: { min: target.nutritionPerServing.calories * 0.7, max: target.nutritionPerServing.calories * 1.4 },
          protein: { min: target.nutritionPerServing.protein * 0.7, max: target.nutritionPerServing.protein * 1.4 },
          carbs: { min: target.nutritionPerServing.carbs * 0.7, max: target.nutritionPerServing.carbs * 1.4 },
          fat: { min: target.nutritionPerServing.fat * 0.7, max: target.nutritionPerServing.fat * 1.4 },
        },
        dietaryFlags: 'veg',
        source: 'Snapshot',
        verified: false,
        active: true,
      };

      const recalc = calculateItemNutrition(baseFood as FoodItem, newQty);
      updated[index] = {
        ...target,
        quantity: newQty,
        calculatedNutrition: recalc,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setMealItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculated Meal Totals
  const mealTotals = useMemo(() => calculateMealTotals(mealItems), [mealItems]);

  // Submit complete meal
  const handleSaveMeal = async () => {
    if (mealItems.length === 0) {
      setSubmitError('Please add at least one food item to this meal.');
      return;
    }

    setSubmittingMeal(true);
    setSubmitError(null);

    try {
      await onSaveMeal({
        mealType,
        date: mealDate,
        time: mealTime,
        items: mealItems,
        notes: mealNotes,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to save meal entry.');
    } finally {
      setSubmittingMeal(false);
    }
  };

  // Create custom food
  const handleSaveCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setCustomModalError('Please enter a food name');
      return;
    }

    setSavingCustom(true);
    setCustomModalError(null);

    try {
      const created = await saveUserCustomFood(userId, {
        name: customName.trim(),
        categoryId: customCategory,
        servingUnit: 'serving',
        servingAmount: 1,
        servingDescription: customServingDesc.trim() || '1 serving',
        calories: Number(customCalories) || 0,
        protein: Number(customProtein) || 0,
        carbs: Number(customCarbs) || 0,
        fat: Number(customFat) || 0,
        fiber: Number(customFiber) || 0,
        dietaryFlags: customDiet,
      });

      setCustomFoods(prev => [created, ...prev]);
      setSearchResults(prev => [created, ...prev]);
      handleSelectFood(created);
      setShowCustomModal(false);

      // Reset form
      setCustomName('');
      setCustomServingDesc('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setCustomFiber('');
    } catch (err: any) {
      setCustomModalError(err?.message || 'Failed to create custom food.');
    } finally {
      setSavingCustom(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fade-in">
      <div className="bg-white border border-[rgba(18,22,15,0.12)] rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full h-[95vh] sm:h-[88vh] flex flex-col overflow-hidden">
        {/* ── Modal Header ── */}
        <div className="p-4 sm:p-5 border-b border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold">
              <Utensils size={20} />
            </div>
            <div>
              <h2 className="font-['Outfit'] text-base sm:text-lg font-black text-[#12160F] m-0">
                {initialMeal ? 'EDIT MEAL ENTRY' : 'LOG YOUR MEAL'}
              </h2>
              <p className="text-[0.7rem] sm:text-xs text-[#586151] m-0">
                Select real foods from the FLUETAS catalog or your custom library.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Meal Type Selector */}
            <select
              value={mealType}
              onChange={e => setMealType(e.target.value as MealType)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#12160F] outline-none"
            >
              {MEAL_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Date */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F]">
              <Calendar size={13} className="text-[#586151]" />
              <input
                type="date"
                value={mealDate}
                onChange={e => setMealDate(e.target.value)}
                className="outline-none bg-transparent text-xs"
              />
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F]">
              <Clock size={13} className="text-[#586151]" />
              <input
                type="time"
                value={mealTime}
                onChange={e => setMealTime(e.target.value)}
                className="outline-none bg-transparent text-xs"
              />
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#586151] hover:text-[#12160F] hover:bg-black/5 cursor-pointer ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Mobile Tab Switcher ── */}
        <div className="flex sm:hidden border-b border-[rgba(18,22,15,0.08)] bg-white shrink-0">
          <button
            onClick={() => setMobileTab('browse')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center ${
              mobileTab === 'browse'
                ? 'border-[#2E7D32] text-[#2E7D32]'
                : 'border-transparent text-[#586151]'
            }`}
          >
            1. Browse Foods
          </button>
          <button
            onClick={() => setMobileTab('meal')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center flex items-center justify-center gap-1.5 ${
              mobileTab === 'meal'
                ? 'border-[#2E7D32] text-[#2E7D32]'
                : 'border-transparent text-[#586151]'
            }`}
          >
            <span>2. Current Meal</span>
            <span className="w-5 h-5 rounded-full bg-[#2E7D32] text-white text-[0.65rem] flex items-center justify-center">
              {mealItems.length}
            </span>
          </button>
        </div>

        {/* ── Error Banner ── */}
        {submitError && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle size={15} />
            <span>{submitError}</span>
          </div>
        )}

        {/* ── Main Responsive Body ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* ════════ LEFT PANEL: Food Discovery & Search ════════ */}
          <div
            className={`w-full lg:w-3/5 border-r border-[rgba(18,22,15,0.08)] flex flex-col overflow-hidden ${
              mobileTab === 'browse' ? 'flex' : 'hidden sm:flex'
            }`}
          >
            {/* Search Input Bar */}
            <div className="p-3 sm:p-4 border-b border-[rgba(18,22,15,0.08)] bg-white space-y-2.5 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9482]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search 'roti, dal, paneer, chicken, egg, banana'..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] text-xs sm:text-sm outline-none focus:border-[#2E7D32]"
                />
              </div>

              {/* Category Pills Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {FOOD_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                      selectedCategory === cat.id
                        ? 'bg-[#12160F] text-white shadow-xs'
                        : 'bg-[#FAFAF6] text-[#586151] hover:bg-[#F2F4EE]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Dietary & Custom Filters */}
              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'veg', label: 'Vegetarian' },
                    { id: 'vegan', label: 'Vegan' },
                    { id: 'egg', label: 'Egg' },
                  ].map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDietaryFilter(d.id as any)}
                      className={`px-2.5 py-0.5 rounded-md text-[0.68rem] font-bold cursor-pointer transition-colors ${
                        dietaryFilter === d.id
                          ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/30'
                          : 'text-[#8A9482] hover:text-[#12160F]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCustomModal(true)}
                  className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Custom Food</span>
                </button>
              </div>
            </div>

            {/* Food Results List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {loadingCatalog ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-[#F2F4EE] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="font-bold text-sm text-[#12160F] m-0">No matching foods found</p>
                  <p className="text-xs text-[#586151] m-0 mt-1 max-w-sm mx-auto">
                    Can&apos;t find your specific food or recipe? Create and save it directly to your personal library.
                  </p>
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="btn-primary mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                  >
                    <Plus size={14} /> Add Custom Food
                  </button>
                </div>
              ) : (
                searchResults.map(food => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <div
                      key={food.id}
                      onClick={() => isSelected ? setSelectedFood(null) : handleSelectFood(food)}
                      className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                          : 'border-[rgba(18,22,15,0.08)] bg-white hover:border-[#2E7D32]/40 hover:bg-[#FAFAF6]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-['Outfit'] font-bold text-xs sm:text-sm text-[#12160F] m-0 truncate">
                            {food.name}
                          </h4>
                          {food.isCustom ? (
                            <span className="text-[0.6rem] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                              MY CUSTOM FOOD
                            </span>
                          ) : (
                            <span className="text-[0.6rem] font-bold px-1.5 py-0.2 rounded bg-[#2E7D32]/10 text-[#2E7D32] shrink-0">
                              VERIFIED
                            </span>
                          )}
                        </div>

                        <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5 truncate">
                          Serving: {food.servingDescription}
                        </p>

                        <div className="flex items-center gap-3 text-[0.68rem] text-[#8A9482] mt-1.5">
                          <span className="font-bold text-[#12160F]">{food.baseNutrition.calories} kcal</span>
                          <span>P: <strong className="text-[#12160F]">{food.baseNutrition.protein}g</strong></span>
                          <span>C: <strong className="text-[#12160F]">{food.baseNutrition.carbs}g</strong></span>
                          <span>F: <strong className="text-[#12160F]">{food.baseNutrition.fat}g</strong></span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          if (isSelected) {
                            setSelectedFood(null);
                          } else {
                            handleSelectFood(food);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            : 'bg-[#FAFAF6] text-[#12160F] border border-[rgba(18,22,15,0.12)] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32]'
                        }`}
                      >
                        {isSelected ? 'Deselect' : 'Select'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ════════ RIGHT PANEL: Portion Calibrator & Meal Composition ════════ */}
          <div
            className={`w-full lg:w-2/5 flex flex-col bg-[#FAFAF6] overflow-hidden ${
              mobileTab === 'meal' ? 'flex' : 'hidden sm:flex'
            }`}
          >
            {/* 1. Selected Food Portion Panel (If Food Selected) */}
            {selectedFood && (
              <div className="p-4 sm:p-5 border-b border-[rgba(18,22,15,0.08)] bg-white shadow-xs space-y-3.5 shrink-0 animate-slide-up">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#2E7D32]">
                      Configure Portion
                    </span>
                    <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-[#12160F] m-0">
                      {selectedFood.name}
                    </h3>
                    <p className="text-[0.68rem] text-[#586151] m-0 mt-0.5">
                      Base Reference: {selectedFood.servingDescription}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedFood(null)}
                    className="text-[#8A9482] hover:text-[#12160F]"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Portion Quantity Stepper */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.08)]">
                  <span className="text-xs font-bold text-[#12160F]">Portion Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(0.5, prev - 0.5))}
                      className="w-7 h-7 rounded-lg bg-white border border-[rgba(18,22,15,0.12)] flex items-center justify-center font-bold text-sm hover:bg-black/5"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="font-['Outfit'] font-bold text-sm text-[#12160F] w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => prev + 0.5)}
                      className="w-7 h-7 rounded-lg bg-white border border-[rgba(18,22,15,0.12)] flex items-center justify-center font-bold text-sm hover:bg-black/5"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* Real-time Recalculated Nutrition Grid */}
                {activeItemNutrition && (
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="p-2 bg-[#F2F4EE] rounded-lg">
                      <span className="text-[0.6rem] text-[#586151] block">Calories</span>
                      <strong className="text-xs text-[#12160F] block">{activeItemNutrition.calories}</strong>
                    </div>
                    <div className="p-2 bg-[#F2F4EE] rounded-lg">
                      <span className="text-[0.6rem] text-[#586151] block">Protein</span>
                      <strong className="text-xs text-[#2E6DA4] block">{activeItemNutrition.protein}g</strong>
                    </div>
                    <div className="p-2 bg-[#F2F4EE] rounded-lg">
                      <span className="text-[0.6rem] text-[#586151] block">Carbs</span>
                      <strong className="text-xs text-[#2E7D32] block">{activeItemNutrition.carbs}g</strong>
                    </div>
                    <div className="p-2 bg-[#F2F4EE] rounded-lg">
                      <span className="text-[0.6rem] text-[#586151] block">Fat</span>
                      <strong className="text-xs text-[#D97706] block">{activeItemNutrition.fat}g</strong>
                    </div>
                  </div>
                )}

                {/* Optional Nutrition Override Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOverride(!showOverride)}
                    className="text-[0.68rem] text-[#586151] hover:text-[#12160F] flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Sliders size={11} />
                    <span>{showOverride ? 'Hide custom recipe variation' : 'Adjust recipe variation (oil, ghee, size)'}</span>
                  </button>

                  {showOverride && (
                    <div className="mt-2 p-3 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.08)] space-y-2 text-xs">
                      <p className="text-[0.65rem] text-[#8A9482] m-0 leading-tight">
                        Adjust values if your home preparation differs. Values must stay within the realistic range.
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        <input
                          type="number"
                          value={overrideCalories}
                          onChange={e => setOverrideCalories(e.target.value)}
                          placeholder={`${activeItemNutrition?.calories} kcal`}
                          className="px-2 py-1 rounded bg-white border border-[rgba(18,22,15,0.12)] text-[0.7rem] outline-none text-center"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={overrideProtein}
                          onChange={e => setOverrideProtein(e.target.value)}
                          placeholder={`${activeItemNutrition?.protein}g P`}
                          className="px-2 py-1 rounded bg-white border border-[rgba(18,22,15,0.12)] text-[0.7rem] outline-none text-center"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={overrideCarbs}
                          onChange={e => setOverrideCarbs(e.target.value)}
                          placeholder={`${activeItemNutrition?.carbs}g C`}
                          className="px-2 py-1 rounded bg-white border border-[rgba(18,22,15,0.12)] text-[0.7rem] outline-none text-center"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={overrideFat}
                          onChange={e => setOverrideFat(e.target.value)}
                          placeholder={`${activeItemNutrition?.fat}g F`}
                          className="px-2 py-1 rounded bg-white border border-[rgba(18,22,15,0.12)] text-[0.7rem] outline-none text-center"
                        />
                      </div>
                      {overrideError && (
                        <p className="text-[0.65rem] text-red-600 m-0 font-semibold">{overrideError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="px-3 py-2.5 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] hover:bg-black/5 cursor-pointer"
                  >
                    Cancel Selection
                  </button>
                  <button
                    type="button"
                    onClick={handleAddItemToMeal}
                    className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Add to {mealType}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Current Meal Composition Header */}
            <div className="p-3 sm:p-4 border-b border-[rgba(18,22,15,0.06)] bg-[#FAFAF6] flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-bold text-[#12160F] uppercase tracking-wider block">
                  {mealType} COMPOSITION
                </span>
                <span className="text-[0.68rem] text-[#586151]">
                  {mealItems.length} food item(s) selected
                </span>
              </div>

              {mealItems.length > 0 && (
                <button
                  onClick={() => setMealItems([])}
                  className="text-[0.68rem] text-red-600 hover:underline font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* 3. Current Meal Items Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {mealItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8A9482] space-y-1">
                  <p className="text-2xl m-0">🍽️</p>
                  <p className="font-bold text-[#12160F] m-0">Your {mealType} is empty</p>
                  <p className="m-0">Search and select foods from the left to build this meal.</p>
                </div>
              ) : (
                mealItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-[rgba(18,22,15,0.08)] shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-[#12160F] m-0 truncate">
                        {item.foodNameSnapshot}
                      </p>
                      <p className="text-[0.65rem] text-[#586151] m-0">
                        {item.quantity}x {item.servingDescription}
                      </p>
                      <div className="flex items-center gap-2 text-[0.65rem] text-[#8A9482] mt-1">
                        <strong className="text-[#12160F]">{item.calculatedNutrition.calories} kcal</strong>
                        <span>P: {item.calculatedNutrition.protein}g</span>
                        <span>C: {item.calculatedNutrition.carbs}g</span>
                        <span>F: {item.calculatedNutrition.fat}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(idx, Math.max(0.5, item.quantity - 0.5))}
                          className="w-6 h-6 rounded bg-[#F2F4EE] flex items-center justify-center text-xs font-bold hover:bg-black/10"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(idx, item.quantity + 0.5)}
                          className="w-6 h-6 rounded bg-[#F2F4EE] flex items-center justify-center text-xs font-bold hover:bg-black/10"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded text-[#8A9482] hover:text-red-600"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 4. Meal Summary & Save Controls */}
            <div className="p-4 bg-white border-t border-[rgba(18,22,15,0.08)] space-y-3 shrink-0">
              <div className="p-3 bg-[#FAFAF6] rounded-xl border border-[rgba(18,22,15,0.08)] flex items-center justify-between">
                <div>
                  <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase block">Total Meal Energy</span>
                  <span className="font-['Outfit'] text-xl font-black text-[#12160F]">
                    {mealTotals.calories} <span className="text-xs font-normal text-[#586151]">kcal</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-right text-xs">
                  <div>
                    <span className="text-[0.6rem] text-[#8A9482] block">Protein</span>
                    <strong className="text-[#2E6DA4]">{mealTotals.protein}g</strong>
                  </div>
                  <div>
                    <span className="text-[0.6rem] text-[#8A9482] block">Carbs</span>
                    <strong className="text-[#2E7D32]">{mealTotals.carbs}g</strong>
                  </div>
                  <div>
                    <span className="text-[0.6rem] text-[#8A9482] block">Fat</span>
                    <strong className="text-[#D97706]">{mealTotals.fat}g</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                {initialMeal && initialMeal.id && onDeleteMeal ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this meal record?')) {
                        await onDeleteMeal(initialMeal.id);
                        onClose();
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Delete Meal</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs font-bold text-[#586151] hover:text-[#12160F] hover:bg-[#FAFAF6] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingMeal || mealItems.length === 0}
                    onClick={handleSaveMeal}
                    className="btn-primary px-6 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {submittingMeal ? (
                      <span>Saving {mealType}...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Save {mealType}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Custom Food Modal ── */}
      {showCustomModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[rgba(18,22,15,0.08)] pb-3">
              <div>
                <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-[#12160F] m-0">
                  ADD CUSTOM FOOD
                </h3>
                <p className="text-[0.68rem] text-[#586151] m-0">
                  Save your specific recipe to &quot;My Custom Foods&quot;.
                </p>
              </div>
              <button onClick={() => setShowCustomModal(false)} className="text-[#8A9482] hover:text-[#12160F]">
                <X size={18} />
              </button>
            </div>

            {customModalError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                {customModalError}
              </div>
            )}

            <form onSubmit={handleSaveCustomFood} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#12160F] font-bold mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Homemade Sattu Drink"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  >
                    {FOOD_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Serving Description *</label>
                  <input
                    type="text"
                    required
                    value={customServingDesc}
                    onChange={e => setCustomServingDesc(e.target.value)}
                    placeholder="e.g. 1 glass (250ml)"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Calories *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="3000"
                    value={customCalories}
                    onChange={e => setCustomCalories(e.target.value)}
                    placeholder="kcal"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    value={customProtein}
                    onChange={e => setCustomProtein(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="500"
                    value={customCarbs}
                    onChange={e => setCustomCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    value={customFat}
                    onChange={e => setCustomFat(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(18,22,15,0.08)]">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[rgba(18,22,15,0.15)] font-bold text-[#586151]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustom}
                  className="btn-primary px-4 py-1.5 text-xs font-bold"
                >
                  {savingCustom ? 'Saving...' : 'Save & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
