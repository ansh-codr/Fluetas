import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { FoodItem, DietaryFlag } from '../nutrition/types';
import { INITIAL_FOOD_CATALOG } from '../nutrition/foodCatalog';

/**
 * Searches the verified catalog and the user's custom foods.
 */
export async function searchFoodCatalog(
  searchTerm: string,
  categoryId?: string,
  dietaryFilter?: DietaryFlag | 'all',
  userId?: string
): Promise<FoodItem[]> {
  const queryClean = searchTerm.trim().toLowerCase();

  // 1. Start with initial verified catalog
  let allFoods: FoodItem[] = [...INITIAL_FOOD_CATALOG];

  // 2. Load custom foods for authenticated user if userId provided
  if (userId && db) {
    try {
      const customSnap = await getDocs(collection(db, 'users', userId, 'customFoods'));
      const customItems = customSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        isCustom: true,
      } as FoodItem));
      allFoods = [...customItems, ...allFoods];
    } catch (err) {
      console.warn('[FoodCatalogService] Failed to load custom foods:', err);
    }
  }

  // 3. Filter by category
  if (categoryId && categoryId !== 'all') {
    allFoods = allFoods.filter(f => f.categoryId === categoryId);
  }

  // 4. Filter by dietary flag
  if (dietaryFilter && dietaryFilter !== 'all') {
    allFoods = allFoods.filter(f => {
      if (dietaryFilter === 'veg') return f.dietaryFlags === 'veg' || f.dietaryFlags === 'vegan';
      if (dietaryFilter === 'vegan') return f.dietaryFlags === 'vegan';
      if (dietaryFilter === 'egg') return f.dietaryFlags === 'egg' || f.dietaryFlags === 'veg' || f.dietaryFlags === 'vegan';
      return true;
    });
  }

  // 5. Search query matching
  if (queryClean) {
    allFoods = allFoods.filter(f => {
      const nameMatch = f.name.toLowerCase().includes(queryClean);
      const hindiMatch = f.hindiName ? f.hindiName.toLowerCase().includes(queryClean) : false;
      const aliasMatch = f.aliases?.some(a => a.toLowerCase().includes(queryClean)) || false;
      const catMatch = f.categoryId.toLowerCase().includes(queryClean);
      return nameMatch || hindiMatch || aliasMatch || catMatch;
    });
  }

  return allFoods;
}

/**
 * Fetches a single food item by ID.
 */
export async function getFoodItemById(id: string, userId?: string): Promise<FoodItem | null> {
  // Check static catalog
  const catalogMatch = INITIAL_FOOD_CATALOG.find(f => f.id === id);
  if (catalogMatch) return catalogMatch;

  // Check custom foods if userId available
  if (userId && db) {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'customFoods'));
      const found = snap.docs.find(d => d.id === id);
      if (found) {
        return { id: found.id, ...found.data(), isCustom: true } as FoodItem;
      }
    } catch {}
  }

  return null;
}

/**
 * Retrieves the user's custom foods collection.
 */
export async function getUserCustomFoods(userId: string): Promise<FoodItem[]> {
  if (!db || !userId) return [];
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'customFoods'));
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      isCustom: true,
    } as FoodItem));
  } catch (err) {
    console.warn('[FoodCatalogService] getUserCustomFoods error:', err);
    return [];
  }
}

/**
 * Creates and persists a new Custom Food for the authenticated user.
 */
export async function saveUserCustomFood(
  userId: string,
  foodData: {
    name: string;
    categoryId: string;
    servingUnit: any;
    servingAmount: number;
    servingDescription: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    dietaryFlags?: DietaryFlag;
    allergens?: string[];
  }
): Promise<FoodItem> {
  if (!db) throw new Error('Firebase database not configured');
  if (!userId) throw new Error('User ID is required');

  if (!foodData.name.trim()) throw new Error('Food name is required');
  if (foodData.calories < 0 || foodData.calories > 3000) {
    throw new Error('Calories must be between 0 and 3,000 kcal per serving');
  }
  if (foodData.protein < 0 || foodData.protein > 300) {
    throw new Error('Protein must be between 0 and 300g per serving');
  }
  if (foodData.carbs < 0 || foodData.carbs > 500) {
    throw new Error('Carbohydrates must be between 0 and 500g per serving');
  }
  if (foodData.fat < 0 || foodData.fat > 300) {
    throw new Error('Fat must be between 0 and 300g per serving');
  }

  const customId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const ref = doc(db, 'users', userId, 'customFoods', customId);

  const newCustomFood: FoodItem = {
    id: customId,
    name: foodData.name.trim(),
    categoryId: foodData.categoryId || 'other',
    servingUnit: foodData.servingUnit || 'serving',
    servingAmount: Number(foodData.servingAmount) || 1,
    servingDescription: foodData.servingDescription.trim() || `1 ${foodData.servingUnit || 'serving'}`,
    baseNutrition: {
      calories: Math.round(foodData.calories),
      protein: Math.round(foodData.protein * 10) / 10,
      carbs: Math.round(foodData.carbs * 10) / 10,
      fat: Math.round(foodData.fat * 10) / 10,
      fiber: Math.round((foodData.fiber || 0) * 10) / 10,
    },
    allowedNutritionRange: {
      calories: {
        min: Math.max(0, Math.round(foodData.calories * 0.7)),
        max: Math.round(foodData.calories * 1.4),
      },
      protein: {
        min: Math.max(0, Math.round(foodData.protein * 0.7 * 10) / 10),
        max: Math.round(foodData.protein * 1.4 * 10) / 10,
      },
      carbs: {
        min: Math.max(0, Math.round(foodData.carbs * 0.7 * 10) / 10),
        max: Math.round(foodData.carbs * 1.4 * 10) / 10,
      },
      fat: {
        min: Math.max(0, Math.round(foodData.fat * 0.7 * 10) / 10),
        max: Math.round(foodData.fat * 1.4 * 10) / 10,
      },
    },
    dietaryFlags: foodData.dietaryFlags || 'veg',
    allergens: foodData.allergens || [],
    source: 'Customer Custom Food',
    sourceReference: 'User Generated',
    verified: false,
    active: true,
    isCustom: true,
    createdBy: userId,
    createdAt: Date.now(),
  };

  await setDoc(ref, newCustomFood);
  return newCustomFood;
}

/**
 * Deletes a custom food item.
 */
export async function deleteUserCustomFood(userId: string, foodId: string): Promise<void> {
  if (!db || !userId || !foodId) return;
  await deleteDoc(doc(db, 'users', userId, 'customFoods', foodId));
}
