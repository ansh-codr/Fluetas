import { describe, it, expect } from 'vitest';
import { INITIAL_FOOD_CATALOG } from '../src/lib/nutrition/foodCatalog';
import {
  calculateItemNutrition,
  calculateMealTotals,
  calculateDailyNutrition,
  validateNutritionOverride,
  roundCalories,
  roundMacro,
} from '../src/lib/nutrition/calculator';
import { FoodItem, MealItem, MealEntry } from '../src/lib/nutrition/types';

describe('FLUETAS Nutrition Catalog & Calculation Engine', () => {
  it('contains verified staple Indian and global foods with metadata', () => {
    expect(INITIAL_FOOD_CATALOG.length).toBeGreaterThan(20);

    const roti = INITIAL_FOOD_CATALOG.find(f => f.id === 'food_roti_phulka');
    expect(roti).toBeDefined();
    expect(roti?.name).toContain('Roti');
    expect(roti?.baseNutrition.calories).toBe(104);
    expect(roti?.baseNutrition.protein).toBe(3.1);
    expect(roti?.source).toContain('ICMR');
    expect(roti?.verified).toBe(true);
  });

  it('correctly calculates portion scaling for multiple servings without manual math', () => {
    const roti = INITIAL_FOOD_CATALOG.find(f => f.id === 'food_roti_phulka')!;

    // 1 serving
    const oneServing = calculateItemNutrition(roti, 1);
    expect(oneServing.calories).toBe(104);
    expect(oneServing.protein).toBe(3.1);
    expect(oneServing.carbs).toBe(22.4);
    expect(oneServing.fat).toBe(0.5);

    // 2 servings
    const twoServings = calculateItemNutrition(roti, 2);
    expect(twoServings.calories).toBe(208);
    expect(twoServings.protein).toBe(6.2);
    expect(twoServings.carbs).toBe(44.8);
    expect(twoServings.fat).toBe(1.0);

    // 3 servings
    const threeServings = calculateItemNutrition(roti, 3);
    expect(threeServings.calories).toBe(312);
    expect(threeServings.protein).toBe(9.3);
    expect(threeServings.carbs).toBe(67.2);
    expect(threeServings.fat).toBe(1.5);
  });

  it('validates recipe variation overrides within realistic bounds', () => {
    const roti = INITIAL_FOOD_CATALOG.find(f => f.id === 'food_roti_phulka')!;

    // Allowed calories range for 1 roti is 80 - 140 kcal
    // Valid homemade variation (e.g. 115 kcal with light ghee)
    const validVariation = validateNutritionOverride(roti, 1, { calories: 115 });
    expect(validVariation.valid).toBe(true);

    // Unrealistic calorie variation (e.g. 800 kcal for 1 roti)
    const invalidHigh = validateNutritionOverride(roti, 1, { calories: 800 });
    expect(invalidHigh.valid).toBe(false);
    expect(invalidHigh.message).toContain('outside the expected range');

    // Unrealistic low variation (e.g. 20 kcal for 1 whole wheat roti)
    const invalidLow = validateNutritionOverride(roti, 1, { calories: 20 });
    expect(invalidLow.valid).toBe(false);
  });

  it('accurately aggregates meal totals from multiple diverse items', () => {
    const roti = INITIAL_FOOD_CATALOG.find(f => f.id === 'food_roti_phulka')!;
    const dal = INITIAL_FOOD_CATALOG.find(f => f.id === 'food_moong_dal')!;
    const curd = INITIAL_FOOD_CATALOG.find(f => f.id === 'food_plain_curd')!;

    const items: MealItem[] = [
      {
        foodId: roti.id,
        foodNameSnapshot: roti.name,
        servingDescription: roti.servingDescription,
        quantity: 2,
        servingUnit: roti.servingUnit,
        nutritionPerServing: roti.baseNutrition,
        calculatedNutrition: calculateItemNutrition(roti, 2),
      },
      {
        foodId: dal.id,
        foodNameSnapshot: dal.name,
        servingDescription: dal.servingDescription,
        quantity: 1,
        servingUnit: dal.servingUnit,
        nutritionPerServing: dal.baseNutrition,
        calculatedNutrition: calculateItemNutrition(dal, 1),
      },
      {
        foodId: curd.id,
        foodNameSnapshot: curd.name,
        servingDescription: curd.servingDescription,
        quantity: 1,
        servingUnit: curd.servingUnit,
        nutritionPerServing: curd.baseNutrition,
        calculatedNutrition: calculateItemNutrition(curd, 1),
      },
    ];

    const mealTotals = calculateMealTotals(items);

    // Roti (208 kcal) + Dal (148 kcal) + Curd (86 kcal) = 442 kcal
    expect(mealTotals.calories).toBe(442);
    // Protein: 6.2 + 8.5 + 4.2 = 18.9g
    expect(mealTotals.protein).toBe(18.9);
    // Carbs: 44.8 + 21.2 + 6.0 = 72.0g
    expect(mealTotals.carbs).toBe(72.0);
    // Fat: 1.0 + 3.4 + 5.0 = 9.4g
    expect(mealTotals.fat).toBe(9.4);
  });

  it('computes daily totals with proper precision and handles empty states', () => {
    // 0 meals logged
    const emptyDaily = calculateDailyNutrition([]);
    expect(emptyDaily.calories).toBe(0);
    expect(emptyDaily.protein).toBe(0);
    expect(emptyDaily.carbs).toBe(0);
    expect(emptyDaily.fat).toBe(0);

    // With meals
    const dummyMeals: MealEntry[] = [
      {
        id: 'meal_1',
        userId: 'u1',
        mealType: 'Breakfast',
        date: '2026-09-03',
        time: '08:30',
        items: [],
        foodItems: ['1x Poha'],
        calories: 245,
        macros: { protein: 4.8, carbs: 46.2, fat: 4.9 },
        fiber: 3.1,
        totals: { calories: 245, protein: 4.8, carbs: 46.2, fat: 4.9, fiber: 3.1 },
        timestamp: {} as any,
      },
      {
        id: 'meal_2',
        userId: 'u1',
        mealType: 'Lunch',
        date: '2026-09-03',
        time: '13:15',
        items: [],
        foodItems: ['2x Roti', '1x Moong Dal'],
        calories: 356,
        macros: { protein: 14.7, carbs: 66.0, fat: 4.4 },
        fiber: 8.0,
        totals: { calories: 356, protein: 14.7, carbs: 66.0, fat: 4.4, fiber: 8.0 },
        timestamp: {} as any,
      },
    ];

    const daily = calculateDailyNutrition(dummyMeals);
    expect(daily.calories).toBe(601);
    expect(daily.protein).toBe(19.5);
    expect(daily.carbs).toBe(112.2);
    expect(daily.fat).toBe(9.3);
  });
});
