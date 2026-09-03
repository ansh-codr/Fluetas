/**
 * Notification Service
 * Writes notifications to /notifications/{userId}/items
 */

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type NotificationType =
  | 'consultation_booked'
  | 'consultation_reminder'
  | 'test_requested'
  | 'report_uploaded'
  | 'report_reviewed'
  | 'recommendation_added'
  | 'consent_revoked'
  | 'followup_scheduled'
  | 'workout_completed'
  | 'trainer_updated_your_plan'
  | 'hydration_target_reached'
  | 'general';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  relatedResourceType?: string;
  relatedResourceId?: string;
}

export async function createNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, 'notifications', userId, 'items'), {
      ...payload,
      read: false,
      createdAt: Timestamp.now(),
    });
  } catch (err) {
    console.warn('[Notifications] Failed to create notification:', err);
  }
}
