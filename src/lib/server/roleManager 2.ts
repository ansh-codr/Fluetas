/**
 * Server-Side Role & Custom Claims Management
 * Authoritatively assigns roles and sets Firebase Custom Claims.
 * Never exposed to or callable directly from client code.
 */

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { recordServerAuditLog } from '@/lib/audit-log';

export type PlatformRole = 'customer' | 'doctor' | 'admin';

export interface AssignRoleParams {
  targetUid: string;
  targetRole: PlatformRole;
  adminUid: string;
  reason?: string;
}

export interface VerifyDoctorParams {
  doctorId: string;
  doctorName?: string;
  status: 'verified' | 'rejected' | 'suspended';
  adminUid: string;
  notes?: string;
}

export async function assignUserRoleServer(params: AssignRoleParams): Promise<{ success: boolean; message: string }> {
  const { targetUid, targetRole, adminUid, reason } = params;

  if (!adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not configured on server');
  }

  // 1. Authoritatively set Firebase Auth Custom Claims
  await adminAuth.setCustomUserClaims(targetUid, { role: targetRole });

  // 2. Authoritatively update Firestore user record
  await adminDb.collection('users').doc(targetUid).set(
    {
      role: targetRole,
      roleUpdatedAt: new Date(),
      roleUpdatedBy: adminUid,
    },
    { merge: true }
  );

  // 3. Write immutable server audit log
  await recordServerAuditLog({
    actorId: adminUid,
    actorRole: 'admin',
    action: 'ADMIN_ASSIGN_ROLE',
    resourceType: 'user_role',
    resourceId: targetUid,
    customerId: targetUid,
    details: `Assigned role '${targetRole}' to user '${targetUid}'. Reason: ${reason || 'Administrative action'}`,
    result: 'SUCCESS',
  });

  return {
    success: true,
    message: `Successfully assigned role '${targetRole}' to user ${targetUid}`,
  };
}

export async function verifyDoctorAccountServer(params: VerifyDoctorParams): Promise<{ success: boolean; message: string }> {
  const { doctorId, doctorName, status, adminUid, notes } = params;

  if (!adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not configured on server');
  }

  const assignedRole: PlatformRole = status === 'verified' ? 'doctor' : 'customer';

  // 1. Set Custom Claims
  await adminAuth.setCustomUserClaims(doctorId, {
    role: assignedRole,
    doctorStatus: status,
  });

  // 2. Update Doctor Record
  await adminDb.collection('doctors').doc(doctorId).set(
    {
      verificationStatus: status,
      verifiedAt: new Date(),
      verifiedBy: adminUid,
      verificationNotes: notes || '',
    },
    { merge: true }
  );

  // 3. Update User Document
  await adminDb.collection('users').doc(doctorId).set(
    {
      role: assignedRole,
      doctorStatus: status,
      updatedAt: new Date(),
    },
    { merge: true }
  );

  // 4. Log Audit Event
  await recordServerAuditLog({
    actorId: adminUid,
    actorRole: 'admin',
    action: status === 'verified' ? 'ADMIN_VERIFY_DOCTOR' : 'ADMIN_SUSPEND_DOCTOR',
    resourceType: 'doctor_profile',
    resourceId: doctorId,
    details: `Doctor verification status changed to '${status}' for ${doctorName || doctorId}. Notes: ${notes || 'None'}`,
    result: 'SUCCESS',
  });

  return {
    success: true,
    message: `Doctor ${doctorId} status updated to '${status}' with role '${assignedRole}'`,
  };
}
