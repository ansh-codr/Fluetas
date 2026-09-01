/**
 * Consultation Service
 * Manages consultation lifecycle under /users/{userId}/consultations
 */

import {
  addDoc,
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTimelineEvent } from './timelineService';
import { createNotification } from './notificationService';

export type ConsultationStatus =
  | 'Requested'
  | 'Booked'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Report Generated'
  | 'Follow-up Required'
  | 'Cancelled';

export interface ConsultationData {
  id?: string;
  userId: string;
  expertId: string;
  expertName: string;
  specialization: string;
  reason: string;
  symptomsReported: string[];
  preferredDate?: string;
  status: ConsultationStatus;
  consentGranted: boolean;
  consentScopes?: Record<string, boolean>;
  clinicalNotes?: string;
  assessment?: string;
  advice?: string;
  suggestedTests?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  scheduledAt?: Timestamp;
  completedAt?: Timestamp;
}

export async function bookConsultation(
  userId: string,
  data: {
    expertId: string;
    expertName: string;
    specialization: string;
    reason: string;
    symptomsReported: string[];
    preferredDate?: string;
    consentScopes?: Record<string, boolean>;
  }
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  if (!data.reason.trim()) throw new Error('Please describe your reason for the consultation.');

  const now = Timestamp.now();
  const consultation: Omit<ConsultationData, 'id'> = {
    userId,
    expertId: data.expertId,
    expertName: data.expertName,
    specialization: data.specialization,
    reason: data.reason.trim(),
    symptomsReported: data.symptomsReported,
    preferredDate: data.preferredDate,
    status: 'Requested',
    consentGranted: true,
    consentScopes: data.consentScopes ?? {
      healthHistory: true,
      previousConsultations: true,
      relevantReports: true,
      currentMedications: true,
    },
    createdAt: now,
    updatedAt: now,
  };

  const ref = await addDoc(collection(db, 'users', userId, 'consultations'), consultation);

  // Create consent record
  await setDoc(doc(db, 'users', userId, 'consents', ref.id), {
    consultationId: ref.id,
    doctorId: data.expertId,
    doctorName: data.expertName,
    grantedScopes: data.consentScopes ?? {
      healthHistory: true,
      previousConsultations: true,
      relevantReports: true,
      currentMedications: true,
    },
    grantedAt: now,
    status: 'Active',
  });

  await addTimelineEvent(userId, {
    type: 'consultation_booked',
    title: 'Consultation Requested',
    description: `${data.expertName} (${data.specialization})`,
    category: 'Clinical',
    badge: 'Requested',
    relatedId: ref.id,
    metadata: { expertId: data.expertId, expertName: data.expertName },
  });

  await createNotification(userId, {
    type: 'consultation_booked',
    title: 'Consultation Requested',
    message: `Your request with ${data.expertName} has been submitted. You will be notified when it is confirmed.`,
    relatedResourceType: 'consultation',
    relatedResourceId: ref.id,
  });

  return ref.id;
}

export async function getUserConsultations(userId: string): Promise<ConsultationData[]> {
  if (!db) return [];
  const q = query(
    collection(db, 'users', userId, 'consultations'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ConsultationData));
}

export async function getUpcomingConsultations(userId: string): Promise<ConsultationData[]> {
  if (!db) return [];
  const all = await getUserConsultations(userId);
  return all.filter(c =>
    ['Requested', 'Booked', 'Scheduled', 'In Progress'].includes(c.status)
  );
}

export async function getPastConsultations(userId: string): Promise<ConsultationData[]> {
  if (!db) return [];
  const all = await getUserConsultations(userId);
  return all.filter(c =>
    ['Completed', 'Report Generated', 'Follow-up Required'].includes(c.status)
  );
}
