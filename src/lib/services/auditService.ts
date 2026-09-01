/**
 * Audit Logging Service
 * Immutably records all clinical and administrative access events.
 * Persists to top-level /auditLogs collection.
 */

import { addDoc, collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type AuditAction =
  | 'doctor_viewed_patient_record'
  | 'doctor_viewed_report'
  | 'doctor_added_consultation_note'
  | 'doctor_requested_test'
  | 'doctor_added_recommendation'
  | 'doctor_reviewed_report'
  | 'doctor_scheduled_follow_up'
  | 'customer_granted_consent'
  | 'customer_revoked_consent'
  | 'customer_uploaded_report'
  | 'admin_verified_doctor'
  | 'admin_rejected_doctor'
  | 'admin_suspended_user'
  | 'admin_reactivated_user'
  | 'admin_viewed_audit_logs';

export interface AuditLogEntry {
  id?: string;
  actorId: string;
  actorEmail?: string;
  actorRole: 'customer' | 'doctor' | 'admin' | 'system';
  action: AuditAction | string;
  resourceType: string;
  resourceId?: string;
  customerId?: string;
  patientName?: string;
  details?: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILURE';
  timestamp: Timestamp;
}

export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, 'auditLogs'), {
      ...entry,
      timestamp: Timestamp.now(),
    });
  } catch (err) {
    console.warn('[AuditService] Failed to record audit log:', err);
  }
}

export async function getAuditLogs(filter?: {
  actorRole?: string;
  action?: string;
  customerId?: string;
  count?: number;
}): Promise<AuditLogEntry[]> {
  if (!db) return [];
  try {
    const constraints: any[] = [orderBy('timestamp', 'desc'), limit(filter?.count || 100)];
    if (filter?.actorRole && filter.actorRole !== 'All') {
      constraints.unshift(where('actorRole', '==', filter.actorRole));
    }
    if (filter?.customerId) {
      constraints.unshift(where('customerId', '==', filter.customerId));
    }

    const q = query(collection(db, 'auditLogs'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogEntry));
  } catch (err) {
    console.warn('[AuditService] Query error:', err);
    return [];
  }
}
