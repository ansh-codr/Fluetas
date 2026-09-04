/**
 * Feedback Service
 * Handles user ratings, bug reports, feature suggestions, and reviews.
 * Persists to Firestore `/feedbacks` with resilient local caching.
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type FeedbackCategory =
  | 'general'
  | 'feature'
  | 'bug'
  | 'consultation'
  | 'nutrition'
  | 'praise';

export type FeedbackStatus =
  | 'new'
  | 'reviewed'
  | 'planned'
  | 'in_progress'
  | 'resolved'
  | 'featured';

export interface FeedbackSubmission {
  id?: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userRole?: string;
  category: FeedbackCategory;
  rating: number; // 1 - 5
  sentiment?: 'love' | 'good' | 'neutral' | 'unhappy';
  title: string;
  message: string;
  tags?: string[];
  pageUrl?: string;
  status: FeedbackStatus;
  isPublic?: boolean;
  createdAt: string; // ISO string
  timestamp?: Timestamp;
}

const LOCAL_STORAGE_KEY = 'fluetas_cached_feedbacks';

// Default featured community reviews if database is empty or loading
export const INITIAL_FEATURED_REVIEWS: FeedbackSubmission[] = [
  {
    id: 'rev-1',
    userName: 'Aarav Sharma',
    userRole: 'Marathon Runner & Athlete',
    category: 'praise',
    rating: 5,
    sentiment: 'love',
    title: 'The continuous health record is a game-changer',
    message: 'Having my workout metrics, recovery sleep, and clinical notes in one single unified timeline has completely changed how I train with my physio.',
    tags: ['Workout Tracking', 'Sovereign Health', 'AI Coach'],
    status: 'featured',
    isPublic: true,
    createdAt: '2026-08-28T10:30:00Z',
  },
  {
    id: 'rev-2',
    userName: 'Dr. Priya Desai',
    userRole: 'Functional Medicine Specialist',
    category: 'consultation',
    rating: 5,
    sentiment: 'love',
    title: 'Seamless patient-consent clinical architecture',
    message: 'The granular consent controls give patients complete confidence. Reviewing real-time biomarkers before our telehealth sessions saves 20 minutes per consultation.',
    tags: ['Clinical Care', 'Consent Management', 'Telehealth'],
    status: 'featured',
    isPublic: true,
    createdAt: '2026-08-25T14:15:00Z',
  },
  {
    id: 'rev-3',
    userName: 'Meera Nambiar',
    userRole: 'Triathlete & Product Lead',
    category: 'feature',
    rating: 5,
    sentiment: 'love',
    title: 'Fluetas Her cycle pacing is incredible',
    message: 'Training phase adjustments tailored to hormonal rhythm have eliminated overtraining fatigue during peak training blocks.',
    tags: ['Fluetas Her', 'Cycle Tracking', 'Recovery'],
    status: 'featured',
    isPublic: true,
    createdAt: '2026-08-22T09:00:00Z',
  },
  {
    id: 'rev-4',
    userName: 'Rohan Kapoor',
    userRole: 'CrossFit Athlete',
    category: 'nutrition',
    rating: 5,
    sentiment: 'love',
    title: 'Clean sports nutrition formulas',
    message: 'Looking forward to the Gut+ and Athlete+ launches. The clean botanical profile with Kokum and Amla matches the holistic training ethos perfectly.',
    tags: ['Nutrition', 'Gut Health', 'Clean Formulation'],
    status: 'featured',
    isPublic: true,
    createdAt: '2026-08-20T16:40:00Z',
  },
];

/**
 * Submit new feedback or bug report
 */
export async function submitFeedback(
  data: Omit<FeedbackSubmission, 'id' | 'status' | 'createdAt'> & {
    status?: FeedbackStatus;
  }
): Promise<string> {
  const newFeedback: FeedbackSubmission = {
    ...data,
    status: data.status || 'new',
    createdAt: new Date().toISOString(),
    isPublic: data.isPublic ?? (data.rating >= 4),
  };

  // 1. Try to save to Firebase Firestore
  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'feedbacks'), {
        ...newFeedback,
        timestamp: Timestamp.now(),
      });
      saveToLocalCache({ ...newFeedback, id: docRef.id });
      return docRef.id;
    } catch (err) {
      console.warn('Firestore feedback submission fallback to local storage:', err);
    }
  }

  // 2. Fallback to LocalStorage
  const fallbackId = `fb-${Date.now()}`;
  saveToLocalCache({ ...newFeedback, id: fallbackId });
  return fallbackId;
}

/**
 * Fetch featured reviews for landing page and feedback showcase
 */
export async function getFeaturedFeedbacks(): Promise<FeedbackSubmission[]> {
  if (db) {
    try {
      const q = query(
        collection(db, 'feedbacks'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(12)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const results = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FeedbackSubmission[];
        return results;
      }
    } catch (err) {
      console.warn('Could not fetch remote feedbacks, using featured defaults:', err);
    }
  }

  // Merge cached submissions with initial featured reviews
  const cached = getLocalCache();
  const publicCached = cached.filter(f => f.isPublic || f.rating >= 4);
  return [...publicCached, ...INITIAL_FEATURED_REVIEWS];
}

/**
 * Fetch public feedbacks filtered by category
 */
export async function getPublicFeedbacks(
  category?: FeedbackCategory | 'all'
): Promise<FeedbackSubmission[]> {
  const all = await getFeaturedFeedbacks();
  if (!category || category === 'all') {
    return all;
  }
  return all.filter(f => f.category === category);
}

/**
 * Get feedbacks submitted by the current user
 */
export async function getUserFeedbacks(userId: string): Promise<FeedbackSubmission[]> {
  if (db && userId) {
    try {
      const q = query(
        collection(db, 'feedbacks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() })) as FeedbackSubmission[];
      }
    } catch (err) {
      console.warn('Could not load user feedbacks from Firestore:', err);
    }
  }

  const cached = getLocalCache();
  return cached.filter(f => f.userId === userId);
}

// Local storage helper
function saveToLocalCache(item: FeedbackSubmission) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalCache();
    const updated = [item, ...list.filter(x => x.id !== item.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch {}
}

function getLocalCache(): FeedbackSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
