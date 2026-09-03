import { FoodItem, MealItem, MealEntry, NutritionalProfile } from './types';

/**
 * Rounds a macro value to 1 decimal place without floating-point artifacts.
 */
export function roundMacro(val: number): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  return Math.round(val * 10) / 10;
}

/**
 * Rounds calories to a whole integer.
 */
export function roundCalories(val: number): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  return Math.round(val);
}

/**
 * Calculates the exact nutritional delivery for a single food item given a portion quantity
 * and optional user recipe/preparation override.
 */
export function calculateItemNutrition(
  food: FoodItem,
  quantity: number,
  override?: Partial<NutritionalProfile>
): NutritionalProfile {
  const safeQty = Math.max(0.1, isNaN(quantity) ? 1 : quantity);

  // If override provided, use override value within allowable bounds, otherwise base * quantity
  const rawCalories = override?.calories !== undefined
    ? override.calories
    : food.baseNutrition.calories * safeQty;

  const rawProtein = override?.protein !== undefined
    ? override.protein
    : food.baseNutrition.protein * safeQty;

  const rawCarbs = override?.carbs !== undefined
    ? override.carbs
    : food.baseNutrition.carbs * safeQty;

  const rawFat = override?.fat !== undefined
    ? override.fat
    : food.baseNutrition.fat * safeQty;

  const rawFiber = override?.fiber !== undefined
    ? override.fiber
    : (food.baseNutrition.fiber || 0) * safeQty;

  return {
    calories: roundCalories(rawCalories),
    protein: roundMacro(rawProtein),
    carbs: roundMacro(rawCarbs),
    fat: roundMacro(rawFat),
    fiber: roundMacro(rawFiber),
  };
}

/**
 * Validates whether an override falls within the catalog's reasonable recipe variation range.
 */
export function validateNutritionOverride(
  food: FoodItem,
  quantity: number,
  override: Partial<NutritionalProfile>
): { valid: boolean; field?: string; message?: string } {
  const safeQty = Math.max(0.1, isNaN(quantity) ? 1 : quantity);

  if (override.calories !== undefined) {
    const minCal = Math.floor(food.allowedNutritionRange.calories.min * safeQty);
    const maxCal = Math.ceil(food.allowedNutritionRange.calories.max * safeQty);
    if (override.calories < minCal || override.calories > maxCal) {
      return {
        valid: false,
        field: 'calories',
        message: `That value is outside the expected range for this food (${minCal}–${maxCal} kcal for ${safeQty} serving). Adjust the portion size or choose a different food variant.`,
      };
    }
  }

  if (override.protein !== undefined) {
    const minP = roundMacro(food.allowedNutritionRange.protein.min * safeQty);
    const maxP = roundMacro(food.allowedNutritionRange.protein.max * safeQty);
    if (override.protein < minP || override.protein > maxP) {
      return {
        valid: false,
        field: 'protein',
        message: `Protein must be between ${minP}g and ${maxP}g for this portion.`,
      };
    }
  }

  if (override.carbs !== undefined) {
    const minC = roundMacro(food.allowedNutritionRange.carbs.min * safeQty);
    const maxC = roundMacro(food.allowedNutritionRange.carbs.max * safeQty);
    if (override.carbs < minC || override.carbs > maxC) {
      return {
        valid: false,
        field: 'carbs',
        message: `Carbohydrates must be between ${minC}g and ${maxC}g for this portion.`,
      };
    }
  }

  if (override.fat !== undefined) {
    const minF = roundMacro(food.allowedNutritionRange.fat.min * safeQty);
    const maxF = roundMacro(food.allowedNutritionRange.fat.max * safeQty);
    if (override.fat < minF || override.fat > maxF) {
      return {
        valid: false,
        field: 'fat',
        message: `Fat must be between ${minF}g and ${maxF}g for this portion.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Computes aggregated totals for a list of meal items.
 */
export function calculateMealTotals(items: MealItem[]): NutritionalProfile {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const item of items) {
    totalCalories += item.calculatedNutrition.calories;
    totalProtein += item.calculatedNutrition.protein;
    totalCarbs += item.calculatedNutrition.carbs;
    totalFat += item.calculatedNutrition.fat;
    totalFiber += item.calculatedNutrition.fiber || 0;
  }

  return {
    calories: roundCalories(totalCalories),
    protein: roundMacro(totalProtein),
    carbs: roundMacro(totalCarbs),
    fat: roundMacro(totalFat),
    fiber: roundMacro(totalFiber),
  };
}

/**
 * Computes daily aggregate totals from real persisted meals.
 */
export function calculateDailyNutrition(meals: MealEntry[]): NutritionalProfile {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const meal of meals) {
    totalCalories += meal.calories || meal.totals?.calories || 0;
    totalProtein += meal.macros?.protein || meal.totals?.protein || 0;
    totalCarbs += meal.macros?.carbs || meal.totals?.carbs || 0;
    totalFat += meal.macros?.fat || meal.totals?.fat || 0;
    totalFiber += meal.fiber || meal.totals?.fiber || 0;
  }

  return {
    calories: roundCalories(totalCalories),
    protein: roundMacro(totalProtein),
    carbs: roundMacro(totalCarbs),
    fat: roundMacro(totalFat),
    fiber: roundMacro(totalFiber),
  };
}
