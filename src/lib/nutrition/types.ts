export type ServingUnit =
  | 'piece'
  | 'bowl'
  | 'cup'
  | 'glass'
  | 'plate'
  | 'tbsp'
  | 'tsp'
  | 'g'
  | 'ml'
  | 'serving';

export type DietaryFlag = 'veg' | 'vegan' | 'egg' | 'non_veg';

export interface NutritionalProfile {
  calories: number; // kcal
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
}

export interface MetricRange {
  min: number;
  max: number;
}

export interface AllowedNutritionRange {
  calories: MetricRange;
  protein: MetricRange;
  carbs: MetricRange;
  fat: MetricRange;
  fiber?: MetricRange;
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface FoodItem {
  id: string;
  name: string;
  hindiName?: string;
  aliases?: string[];
  categoryId: string;
  subcategoryId?: string;
  servingUnit: ServingUnit;
  servingAmount: number;
  servingDescription: string;
  baseNutrition: NutritionalProfile;
  allowedNutritionRange: AllowedNutritionRange;
  dietaryFlags: DietaryFlag;
  allergens?: string[];
  source: string;
  sourceReference?: string;
  verified: boolean;
  active: boolean;
  isCustom?: boolean;
  createdBy?: string; // userId if custom
  createdAt?: number;
}

export interface MealItem {
  foodId: string;
  foodNameSnapshot: string;
  servingDescription: string;
  quantity: number;
  servingUnit: ServingUnit;
  nutritionPerServing: NutritionalProfile;
  nutritionOverride?: Partial<NutritionalProfile>;
  calculatedNutrition: NutritionalProfile;
  isCustom?: boolean;
  dietaryFlags?: DietaryFlag;
}

export type MealType =
  | 'Breakfast'
  | 'Morning Snack'
  | 'Lunch'
  | 'Evening Snack'
  | 'Dinner'
  | 'Post Workout'
  | 'Other';

export interface MealEntry {
  id: string;
  userId: string;
  mealType: MealType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  items: MealItem[];
  foodItems: string[]; // for backwards compatibility
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  fiber: number;
  totals: NutritionalProfile;
  notes?: string;
  timestamp: any;
  createdAt?: any;
  updatedAt?: any;
}
