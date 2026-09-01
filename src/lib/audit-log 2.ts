/**
 * Server-Side Audit Log Service
 * Immutably writes security, clinical, and administrative access records using Firebase Admin.
 */

import { adminDb } from './firebase-admin';

export interface ServerAuditLogPayload {
  actorId: string;
  actorRole: 'customer' | 'doctor' | 'admin' | 'system';
  action: string;
  resourceType: string;
  resourceId?: string;
  customerId?: string;
  details?: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILURE';
  ipAddress?: string;
}

export async function recordServerAuditLog(payload: ServerAuditLogPayload): Promise<void> {
  if (!adminDb) return;

  try {
    await adminDb.collection('auditLogs').add({
      ...payload,
      timestamp: new Date(),
      source: 'vercel_serverless',
    });
  } catch (err) {
    console.warn('[ServerAuditLog] Failed to record audit log:', err);
  }
}
