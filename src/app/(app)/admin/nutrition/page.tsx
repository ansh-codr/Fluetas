'use client';

import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  Tag,
  AlertCircle,
  X,
} from 'lucide-react';
import { INITIAL_FOOD_CATALOG, FOOD_CATEGORIES } from '@/lib/nutrition/foodCatalog';
import { FoodItem, DietaryFlag } from '@/lib/nutrition/types';

export default function AdminNutritionPage() {
  const [catalog, setCatalog] = useState<FoodItem[]>(INITIAL_FOOD_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Food Form State
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [categoryId, setCategoryId] = useState('indian_breads');
  const [servingDescription, setServingDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [dietaryFlags, setDietaryFlags] = useState<DietaryFlag>('veg');
  const [allergens, setAllergens] = useState('');
  const [source, setSource] = useState('ICMR - National Institute of Nutrition (IFCT)');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredFoods = catalog.filter(food => {
    const matchesCat = selectedCategory === 'all' || food.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      food.name.toLowerCase().includes(q) ||
      (food.hindiName && food.hindiName.toLowerCase().includes(q)) ||
      food.aliases?.some(a => a.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  const handleToggleActive = (id: string) => {
    setCatalog(prev =>
      prev.map(f => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Food name is required');
      return;
    }
    const calNum = Number(calories);
    const protNum = Number(protein);
    const carbNum = Number(carbs);
    const fatNum = Number(fat);
    const fibNum = Number(fiber) || 0;

    if (isNaN(calNum) || calNum < 0) {
      setFormError('Please enter a valid calorie value');
      return;
    }

    const newFood: FoodItem = {
      id: `food_${Date.now()}`,
      name: name.trim(),
      hindiName: hindiName.trim() || undefined,
      categoryId,
      servingUnit: 'serving',
      servingAmount: 1,
      servingDescription: servingDescription.trim() || '1 serving',
      baseNutrition: {
        calories: Math.round(calNum),
        protein: Math.round(protNum * 10) / 10,
        carbs: Math.round(carbNum * 10) / 10,
        fat: Math.round(fatNum * 10) / 10,
        fiber: Math.round(fibNum * 10) / 10,
      },
      allowedNutritionRange: {
        calories: { min: Math.round(calNum * 0.7), max: Math.round(calNum * 1.4) },
        protein: { min: Math.round(protNum * 0.7 * 10) / 10, max: Math.round(protNum * 1.4 * 10) / 10 },
        carbs: { min: Math.round(carbNum * 0.7 * 10) / 10, max: Math.round(carbNum * 1.4 * 10) / 10 },
        fat: { min: Math.round(fatNum * 0.7 * 10) / 10, max: Math.round(fatNum * 1.4 * 10) / 10 },
      },
      dietaryFlags,
      allergens: allergens ? allergens.split(',').map(s => s.trim()).filter(Boolean) : [],
      source: source.trim() || 'FLUETAS Verified Nutrition Catalog',
      verified: true,
      active: true,
    };

    setCatalog(prev => [newFood, ...prev]);
    setAddModalOpen(false);

    // Reset
    setName('');
    setHindiName('');
    setServingDescription('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('');
    setAllergens('');
    setFormError(null);
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/20 flex items-center gap-1">
              <ShieldCheck size={11} />
              Admin Clinical Operations
            </span>
          </div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
            NUTRITION &amp; FOOD CATALOG
          </h1>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Maintain verified reference nutritional profiles, portion scales, and acceptable preparation ranges.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus size={15} />
          Add Catalog Food
        </button>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9482]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search catalog foods..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] text-xs text-[#12160F] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {FOOD_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#12160F] text-white'
                  : 'bg-[#FAFAF6] text-[#586151] hover:bg-[#F2F4EE]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="fluetas-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="section-title">VERIFIED FOOD ITEMS ({filteredFoods.length})</span>
          <span className="text-xs text-[#586151]">ICMR / USDA Clinical References</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(18,22,15,0.08)] text-[#8A9482] uppercase text-[0.65rem]">
                <th className="py-2.5 px-3">Food Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Serving Size</th>
                <th className="py-2.5 px-3">Calories</th>
                <th className="py-2.5 px-3">Macros (P / C / F)</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(18,22,15,0.06)]">
              {filteredFoods.map(food => (
                <tr key={food.id} className="hover:bg-[#FAFAF6] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#12160F]">{food.name}</div>
                    {food.hindiName && (
                      <div className="text-[0.68rem] text-[#8A9482]">{food.hindiName}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 capitalize text-[#586151]">
                    {food.categoryId.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-3 text-[#586151]">{food.servingDescription}</td>
                  <td className="py-3 px-3 font-bold text-[#12160F]">
                    {food.baseNutrition.calories} kcal
                  </td>
                  <td className="py-3 px-3 text-[#586151]">
                    <span className="text-[#2E6DA4] font-semibold">{food.baseNutrition.protein}g</span> /{' '}
                    <span className="text-[#2E7D32] font-semibold">{food.baseNutrition.carbs}g</span> /{' '}
                    <span className="text-[#D97706] font-semibold">{food.baseNutrition.fat}g</span>
                  </td>
                  <td className="py-3 px-3 text-[0.68rem] text-[#8A9482] max-w-[180px] truncate">
                    {food.source}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleActive(food.id)}
                      className={`px-2.5 py-1 rounded-md text-[0.68rem] font-bold cursor-pointer transition-colors ${
                        food.active
                          ? 'bg-[#2E7D32]/10 text-[#2E7D32] hover:bg-red-100 hover:text-red-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {food.active ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Catalog Food Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[rgba(18,22,15,0.08)] pb-3">
              <div>
                <h3 className="font-['Outfit'] font-bold text-base text-[#12160F] m-0">
                  ADD OFFICIAL CATALOG FOOD
                </h3>
                <p className="text-xs text-[#586151] m-0">
                  Add a verified baseline item to the global FLUETAS catalog.
                </p>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-[#8A9482] hover:text-[#12160F]">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateFood} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Food Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Masoor Dal Tadka"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Local / Hindi Name</label>
                  <input
                    type="text"
                    value={hindiName}
                    onChange={e => setHindiName(e.target.value)}
                    placeholder="e.g. मसूर दाल"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#12160F] font-bold mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
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
                    value={servingDescription}
                    onChange={e => setServingDescription(e.target.value)}
                    placeholder="e.g. 1 katori (150g)"
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
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                    placeholder="kcal"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={e => setProtein(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbs}
                    onChange={e => setCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#586151] font-semibold mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fat}
                    onChange={e => setFat(e.target.value)}
                    placeholder="g"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#12160F] font-bold mb-1">Source / Citation</label>
                <input
                  type="text"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="e.g. ICMR IFCT 2017 Table B1"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(18,22,15,0.08)]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] font-bold text-[#586151]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
