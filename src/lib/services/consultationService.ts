/**
 * Consultation Service
 * Manages consultation lifecycle under /users/{userId}/consultations and appointments under /appointments
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
  preferredTime?: string;
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

export interface AppointmentRecord {
  id: string;
  customerId: string;
  customerName?: string;
  expertId: string;
  expertName: string;
  date: string;
  time: string;
  status: 'Booked' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  consultationType: string;
  reason: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FollowUpRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  customerId: string;
  customerName: string;
  dueDate: string;
  purpose: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  priority?: 'Normal' | 'Important' | 'Urgent';
  createdAt?: Timestamp;
}

/**
 * Books a real consultation with double-booking collision prevention.
 */
export async function bookConsultation(
  userId: string,
  data: {
    expertId: string;
    expertName: string;
    specialization: string;
    reason: string;
    symptomsReported: string[];
    preferredDate?: string;
    preferredTime?: string;
    customerName?: string;
    consultationType?: string;
    consentScopes?: Record<string, boolean>;
  }
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  if (!data.reason.trim()) throw new Error('Please describe your reason for the consultation.');

  const now = Timestamp.now();
  const dateStr = data.preferredDate || new Date().toISOString().split('T')[0];
  const timeStr = data.preferredTime || '10:00 AM';

  // 1. Double-Booking Collision Prevention Check
  const collisionQuery = query(
    collection(db, 'appointments'),
    where('expertId', '==', data.expertId),
    where('date', '==', dateStr),
    where('time', '==', timeStr),
    where('status', 'in', ['Booked', 'Scheduled', 'In Progress'])
  );
  const collisionSnap = await getDocs(collisionQuery);
  if (!collisionSnap.empty) {
    throw new Error('This consultation slot is already booked. Please select an alternate time.');
  }

  // 2. Persist Consultation Record under customer's sovereign path
  const consultation: Omit<ConsultationData, 'id'> = {
    userId,
    expertId: data.expertId,
    expertName: data.expertName,
    specialization: data.specialization,
    reason: data.reason.trim(),
    symptomsReported: data.symptomsReported,
    preferredDate: dateStr,
    preferredTime: timeStr,
    status: 'Booked',
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

  // 3. Persist Global Appointment Record for Expert Visibility & Collision Prevention
  await setDoc(doc(db, 'appointments', ref.id), {
    id: ref.id,
    customerId: userId,
    customerName: data.customerName || 'Patient',
    expertId: data.expertId,
    expertName: data.expertName,
    date: dateStr,
    time: timeStr,
    status: 'Booked',
    consultationType: data.consultationType || 'Telehealth Video',
    reason: data.reason.trim(),
    createdAt: now,
    updatedAt: now,
  });

  // 4. Create Sovereign Consent Record
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

  // 5. Establish Doctor-Patient Relationship
  await setDoc(doc(db, 'doctorPatientRelationships', `rel_${data.expertId}_${userId}`), {
    relationshipId: `rel_${data.expertId}_${userId}`,
    doctorId: data.expertId,
    customerId: userId,
    customerName: data.customerName || 'Patient',
    status: 'active',
    consentId: ref.id,
    lastConsultationDate: dateStr,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  // 6. Record Health Timeline & Notification
  await addTimelineEvent(userId, {
    type: 'consultation_booked',
    title: 'Consultation Confirmed',
    description: `${data.expertName} (${data.specialization}) · ${dateStr} ${timeStr}`,
    category: 'Clinical',
    badge: 'Confirmed',
    relatedId: ref.id,
    metadata: { expertId: data.expertId, expertName: data.expertName },
  });

  await createNotification(userId, {
    type: 'consultation_booked',
    title: 'Consultation Confirmed',
    message: `Your appointment with ${data.expertName} is confirmed for ${dateStr} at ${timeStr}.`,
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

/**
 * Retrieves all appointments assigned to a specific practitioner from the database.
 */
export async function getDoctorAppointments(doctorId: string): Promise<AppointmentRecord[]> {
  if (!db || !doctorId) return [];
  try {
    const q = query(
      collection(db, 'appointments'),
      where('expertId', '==', doctorId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppointmentRecord));
    return items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (err) {
    console.warn('[ConsultationService] getDoctorAppointments failed:', err);
    return [];
  }
}

/**
 * Retrieves all follow-up reminders created by a practitioner.
 */
export async function getDoctorFollowUpsList(doctorId: string): Promise<FollowUpRecord[]> {
  if (!db || !doctorId) return [];
  try {
    const q = query(
      collection(db, 'doctorFollowUps'),
      where('doctorId', '==', doctorId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FollowUpRecord));
  } catch (err) {
    console.warn('[ConsultationService] getDoctorFollowUpsList failed:', err);
    return [];
  }
}
