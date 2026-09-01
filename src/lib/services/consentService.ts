/**
 * Consent & Doctor-Patient Relationship Service
 * Enforces server-side granular access control before clinical data access.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { logAuditEvent } from './auditService';
import { addTimelineEvent } from './timelineService';

export type ConsentScopeKey =
  | 'health_profile'
  | 'medical_history'
  | 'medications'
  | 'allergies'
  | 'consultations'
  | 'reports'
  | 'workout_data'
  | 'nutrition_data'
  | 'sleep_data'
  | 'HER_data';

export type ConsentStatus = 'active' | 'revoked' | 'expired';

export interface ConsentRecord {
  id?: string;
  consentId: string;
  customerId: string;
  customerName?: string;
  doctorId: string;
  doctorName: string;
  consultationId?: string;
  permissions: Record<ConsentScopeKey | string, boolean>;
  grantedAt: Timestamp;
  expiresAt?: Timestamp;
  revokedAt?: Timestamp;
  status: ConsentStatus;
}

export interface DoctorPatientRelationship {
  id?: string;
  relationshipId: string;
  doctorId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  consultationId?: string;
  consentId: string;
  status: 'pending' | 'active' | 'completed' | 'revoked' | 'expired';
  lastConsultationDate?: string;
  nextFollowUpDate?: string;
  pendingReportsCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function grantConsent(
  customerId: string,
  customerName: string,
  doctorId: string,
  doctorName: string,
  consultationId: string,
  permissions: Record<string, boolean>
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const now = Timestamp.now();
  const consentId = `consent_${customerId}_${doctorId}_${Date.now()}`;

  const consent: ConsentRecord = {
    consentId,
    customerId,
    customerName,
    doctorId,
    doctorName,
    consultationId,
    permissions: {
      health_profile: permissions.healthHistory ?? true,
      medical_history: permissions.healthHistory ?? true,
      medications: permissions.currentMedications ?? true,
      allergies: permissions.healthHistory ?? true,
      consultations: permissions.previousConsultations ?? true,
      reports: permissions.relevantReports ?? true,
      workout_data: permissions.workoutHistory ?? true,
      nutrition_data: permissions.nutritionLogs ?? false,
      sleep_data: permissions.healthHistory ?? true,
      HER_data: permissions.healthHistory ?? false,
      ...permissions,
    },
    grantedAt: now,
    status: 'active',
  };

  // 1. Write Consent
  await setDoc(doc(db, 'consents', consentId), consent);
  await setDoc(doc(db, 'users', customerId, 'consents', consentId), consent);

  // 2. Establish Doctor-Patient Relationship
  const relationshipId = `rel_${doctorId}_${customerId}`;
  const relationship: DoctorPatientRelationship = {
    relationshipId,
    doctorId,
    customerId,
    customerName,
    consultationId,
    consentId,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'doctorPatientRelationships', relationshipId), relationship, { merge: true });

  // 3. Log Audit Trail
  await logAuditEvent({
    actorId: customerId,
    actorRole: 'customer',
    action: 'customer_granted_consent',
    resourceType: 'consent',
    resourceId: consentId,
    customerId,
    details: `Granted data access scopes to ${doctorName}`,
    result: 'SUCCESS',
  });

  return consentId;
}

export async function revokeConsent(customerId: string, consentId: string, doctorName?: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const now = Timestamp.now();

  // 1. Update root consent
  await updateDoc(doc(db, 'consents', consentId), {
    status: 'revoked',
    revokedAt: now,
  });

  // 2. Update user subcollection consent
  try {
    await updateDoc(doc(db, 'users', customerId, 'consents', consentId), {
      status: 'revoked',
      revokedAt: now,
    });
  } catch {
    // ignore if subcollection doc doesn't exist
  }

  // 3. Get consent to find doctorId
  const snap = await getDoc(doc(db, 'consents', consentId));
  if (snap.exists()) {
    const data = snap.data() as ConsentRecord;
    const relId = `rel_${data.doctorId}_${customerId}`;
    try {
      await updateDoc(doc(db, 'doctorPatientRelationships', relId), {
        status: 'revoked',
        updatedAt: now,
      });
    } catch {
      // ignore
    }
  }

  // 4. Log to timeline & audit log
  await addTimelineEvent(customerId, {
    type: 'consent_revoked',
    title: 'Doctor Access Consent Revoked',
    description: `Terminated health record access for ${doctorName || 'provider'}.`,
    category: 'Privacy',
    badge: 'Revoked',
  });

  await logAuditEvent({
    actorId: customerId,
    actorRole: 'customer',
    action: 'customer_revoked_consent',
    resourceType: 'consent',
    resourceId: consentId,
    customerId,
    details: `Revoked consent for doctor access`,
    result: 'SUCCESS',
  });
}

export async function getPatientConsents(customerId: string): Promise<ConsentRecord[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'consents'),
      where('customerId', '==', customerId),
      orderBy('grantedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ConsentRecord));
  } catch {
    return [];
  }
}

export async function validateDoctorAccess(
  doctorId: string,
  customerId: string,
  scope?: ConsentScopeKey | string
): Promise<{ authorized: boolean; consent: ConsentRecord | null; reason?: string }> {
  if (!db) return { authorized: false, consent: null, reason: 'Database not initialized' };

  try {
    const q = query(
      collection(db, 'consents'),
      where('doctorId', '==', doctorId),
      where('customerId', '==', customerId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return { authorized: false, consent: null, reason: 'No active patient consent found for this doctor' };
    }

    const consent = { id: snap.docs[0].id, ...snap.docs[0].data() } as ConsentRecord;

    if (scope && consent.permissions && !consent.permissions[scope]) {
      return { authorized: false, consent, reason: `Patient has not granted permission for: ${scope}` };
    }

    return { authorized: true, consent };
  } catch (err) {
    return { authorized: false, consent: null, reason: 'Validation error' };
  }
}
