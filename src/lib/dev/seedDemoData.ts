/**
 * Dev Seeding Utility
 * Seeds initial demo doctors and resources to Firestore for local testing.
 * Strictly tagged with isDevSeed: true.
 */

import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { mockDoctorsList } from '@/lib/mock/dashboardData';

export async function seedDemoDoctors(): Promise<{ count: number; success: boolean }> {
  if (!db) throw new Error('Firebase not configured');

  let count = 0;
  for (const docData of mockDoctorsList) {
    await setDoc(doc(db, 'doctors', docData.id), {
      name: docData.name,
      specialization: docData.specialization,
      credentials: docData.credentials,
      experience: docData.experience,
      rating: docData.rating,
      reviews: docData.reviews,
      nextSlot: docData.nextSlot,
      fee: docData.fee,
      bio: docData.bio,
      avatarColor: docData.avatarColor,
      avatarInitials: docData.avatarInitials,
      isDevSeed: true,
      createdAt: serverTimestamp(),
    }, { merge: true });
    count++;
  }

  return { count, success: true };
}

export async function seedDemoUserActivity(userId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const today = new Date().toISOString().split('T')[0];

  // 1. Seed hydration
  await addDoc(collection(db, 'hydrationLogs', userId, 'entries'), {
    userId,
    amount: 500,
    type: 'Pure Filtered Water',
    timestamp: serverTimestamp(),
    date: today,
    isDevSeed: true,
  });

  // 2. Seed meal
  await addDoc(collection(db, 'nutritionLogs', userId, 'entries'), {
    userId,
    mealType: 'Breakfast',
    foodItems: ['Steel-cut oats', 'Whey isolate', 'Blueberries', 'Almonds'],
    calories: 450,
    macros: { protein: 32, carbs: 54, fat: 12 },
    timestamp: serverTimestamp(),
    date: today,
    isDevSeed: true,
  });

  // 3. Seed sleep
  await addDoc(collection(db, 'sleepLogs', userId, 'entries'), {
    userId,
    sleepTime: '23:30',
    wakeTime: '07:30',
    durationHrs: 8.0,
    quality: 8,
    date: today,
    timestamp: serverTimestamp(),
    isDevSeed: true,
  });
}
