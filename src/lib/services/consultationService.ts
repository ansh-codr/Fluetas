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
 * Cancels an existing consultation and updates global appointment status.
 */
export async function cancelConsultation(
  userId: string,
  consultationId: string,
  reason?: string
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  if (!userId || !consultationId) throw new Error('User ID and Consultation ID required');

  const now = Timestamp.now();

  // 1. Update sovereign consultation record
  const consRef = doc(db, 'users', userId, 'consultations', consultationId);
  await updateDoc(consRef, {
    status: 'Cancelled',
    cancelReason: reason || 'Cancelled by patient',
    cancelledAt: now,
    updatedAt: now,
  });

  // 2. Update global appointment record
  try {
    const apptRef = doc(db, 'appointments', consultationId);
    await updateDoc(apptRef, {
      status: 'Cancelled',
      cancelReason: reason || 'Cancelled by patient',
      updatedAt: now,
    });
  } catch (err) {
    console.warn('[ConsultationService] update appointment status error:', err);
  }

  // 3. Log timeline event & notification
  await addTimelineEvent(userId, {
    type: 'consultation_cancelled' as any,
    title: 'Consultation Cancelled',
    description: `Appointment was cancelled${reason ? `: ${reason}` : '.'}`,
    category: 'Clinical',
    badge: 'Cancelled',
    relatedId: consultationId,
  });

  await createNotification(userId, {
    type: 'consultation_cancelled' as any,
    title: 'Consultation Cancelled',
    message: `Your appointment has been cancelled successfully.`,
    relatedResourceType: 'consultation',
    relatedResourceId: consultationId,
  });
}

/**
 * Reschedules or updates date, time, and reason for an existing consultation.
 */
export async function rescheduleConsultation(
  userId: string,
  consultationId: string,
  data: {
    expertId?: string;
    preferredDate: string;
    preferredTime: string;
    reason?: string;
    symptomsReported?: string[];
  }
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  if (!userId || !consultationId) throw new Error('User ID and Consultation ID required');

  const now = Timestamp.now();

  // 1. Check double-booking collision if expertId is known
  if (data.expertId) {
    const collisionQuery = query(
      collection(db, 'appointments'),
      where('expertId', '==', data.expertId),
      where('date', '==', data.preferredDate),
      where('time', '==', data.preferredTime),
      where('status', 'in', ['Booked', 'Scheduled', 'In Progress'])
    );
    const collisionSnap = await getDocs(collisionQuery);
    const hasOtherCollision = collisionSnap.docs.some(d => d.id !== consultationId);
    if (hasOtherCollision) {
      throw new Error('This time slot is already booked. Please choose an alternate time.');
    }
  }

  // 2. Update sovereign consultation record
  const consRef = doc(db, 'users', userId, 'consultations', consultationId);
  const updateData: Record<string, any> = {
    preferredDate: data.preferredDate,
    preferredTime: data.preferredTime,
    updatedAt: now,
  };
  if (data.reason !== undefined) updateData.reason = data.reason.trim();
  if (data.symptomsReported !== undefined) updateData.symptomsReported = data.symptomsReported;

  await updateDoc(consRef, updateData);

  // 3. Update global appointment record
  try {
    const apptRef = doc(db, 'appointments', consultationId);
    const apptUpdate: Record<string, any> = {
      date: data.preferredDate,
      time: data.preferredTime,
      updatedAt: now,
    };
    if (data.reason !== undefined) apptUpdate.reason = data.reason.trim();
    await updateDoc(apptRef, apptUpdate);
  } catch (err) {
    console.warn('[ConsultationService] update appointment error:', err);
  }

  // 4. Log timeline event & notification
  await addTimelineEvent(userId, {
    type: 'consultation_rescheduled' as any,
    title: 'Consultation Rescheduled',
    description: `Rescheduled to ${data.preferredDate} at ${data.preferredTime}`,
    category: 'Clinical',
    badge: 'Updated',
    relatedId: consultationId,
  });

  await createNotification(userId, {
    type: 'consultation_rescheduled' as any,
    title: 'Consultation Rescheduled',
    message: `Your appointment has been updated to ${data.preferredDate} at ${data.preferredTime}.`,
    relatedResourceType: 'consultation',
    relatedResourceId: consultationId,
  });
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

/**
 * Doctor confirms/reschedules/cancels an appointment.
 * Updates both the global /appointments doc and the patient's /users/{uid}/consultations doc.
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  customerId: string,
  status: ConsultationStatus,
  extraFields?: { scheduledDate?: string; scheduledTime?: string }
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const now = Timestamp.now();

  // Update global appointment record
  await updateDoc(doc(db, 'appointments', appointmentId), {
    status,
    updatedAt: now,
    ...(extraFields?.scheduledDate ? { date: extraFields.scheduledDate } : {}),
    ...(extraFields?.scheduledTime ? { time: extraFields.scheduledTime } : {}),
  });

  // Mirror status into the patient's sovereign consultation record
  await updateDoc(doc(db, 'users', customerId, 'consultations', appointmentId), {
    status,
    updatedAt: now,
    ...(status === 'Scheduled' ? { scheduledAt: now } : {}),
  });
}

export interface ClinicalNotesPayload {
  clinicalNotes: string;
  assessment?: string;
  advice?: string;
  suggestedTests?: string[];
}

/**
 * Doctor submits post-session clinical notes.
 * Sets status to Completed on both the global appointment and patient record.
 */
export async function addClinicalNotes(
  appointmentId: string,
  customerId: string,
  payload: ClinicalNotesPayload
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const now = Timestamp.now();

  const fields = {
    clinicalNotes: payload.clinicalNotes,
    assessment: payload.assessment || '',
    advice: payload.advice || '',
    suggestedTests: payload.suggestedTests || [],
    status: 'Completed' as ConsultationStatus,
    completedAt: now,
    updatedAt: now,
  };

  // Update the patient's consultation document (primary clinical record)
  await updateDoc(doc(db, 'users', customerId, 'consultations', appointmentId), fields);

  // Update global appointment status
  await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'Completed',
    updatedAt: now,
  });
}

/**
 * Fetch a single consultation document by ID from the patient's subcollection.
 */
export async function getConsultationById(
  userId: string,
  consultationId: string
): Promise<ConsultationData | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'consultations', consultationId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ConsultationData;
  } catch {
    return null;
  }
}

/**
 * Fetch all appointments from the global /appointments collection (admin view).
 */
export async function getAllAppointments(): Promise<AppointmentRecord[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppointmentRecord));
  } catch (err) {
    console.warn('[ConsultationService] getAllAppointments failed:', err);
    return [];
  }
}

