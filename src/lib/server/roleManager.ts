/**
 * Server-Side Role & Custom Claims Management
 * Authoritatively assigns roles and sets Firebase Custom Claims.
 * Never exposed to or callable directly from client code.
 */

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { recordServerAuditLog } from '@/lib/audit-log';

export type PlatformRole = 'customer' | 'doctor' | 'expert' | 'admin';

export interface AssignRoleParams {
  targetUid: string;
  targetRole: PlatformRole;
  adminUid: string;
  reason?: string;
}

export interface VerifyDoctorParams {
  doctorId: string;
  doctorName?: string;
  status: 'verified' | 'rejected' | 'suspended' | 'under_review' | 'pending';
  adminUid: string;
  notes?: string;
}

/**
 * Add an administrator by email address.
 * Strictly verifies account exists in Firebase Auth.
 * Never creates fake accounts.
 */
export async function addAdminByEmailServer(
  email: string,
  adminUid: string
): Promise<{ success: boolean; message: string; targetUid: string }> {
  if (!adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not configured on server');
  }

  const cleanEmail = email.trim().toLowerCase();
  let userRecord;
  try {
    userRecord = await adminAuth.getUserByEmail(cleanEmail);
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      throw new Error('User account not found.');
    }
    throw new Error(err?.message || 'Failed to locate user account');
  }

  const targetUid = userRecord.uid;

  // 1. Authoritatively set Firebase Auth Custom Claims
  await adminAuth.setCustomUserClaims(targetUid, {
    role: 'admin',
    admin: true,
  });

  // 2. Update Firestore user document
  await adminDb.collection('users').doc(targetUid).set(
    {
      role: 'admin',
      status: 'active',
      roleUpdatedAt: new Date(),
      roleUpdatedBy: adminUid,
    },
    { merge: true }
  );

  // 3. Write immutable server audit log
  await recordServerAuditLog({
    actorId: adminUid,
    actorRole: 'admin',
    action: 'ADMIN_ADDED',
    resourceType: 'user_role',
    resourceId: targetUid,
    customerId: targetUid,
    details: `Granted administrative role to ${cleanEmail} (UID: ${targetUid})`,
    result: 'SUCCESS',
  });

  return {
    success: true,
    message: `User ${cleanEmail} successfully promoted to platform administrator.`,
    targetUid,
  };
}

/**
 * Remove an administrator, reverting role to customer.
 */
export async function removeAdminServer(
  targetUid: string,
  adminUid: string
): Promise<{ success: boolean; message: string }> {
  if (!adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not configured on server');
  }

  // Safety: Prevent self-demotion if caller is demoting themselves
  if (targetUid === adminUid) {
    const adminDocs = await adminDb.collection('users').where('role', '==', 'admin').get();
    if (adminDocs.size <= 1) {
      throw new Error('Cannot revoke administrative privileges for the sole remaining administrator.');
    }
  }

  // 1. Revert Custom Claims
  await adminAuth.setCustomUserClaims(targetUid, {
    role: 'customer',
    admin: false,
  });

  // 2. Update Firestore user document
  await adminDb.collection('users').doc(targetUid).set(
    {
      role: 'customer',
      roleUpdatedAt: new Date(),
      roleUpdatedBy: adminUid,
    },
    { merge: true }
  );

  // 3. Write immutable server audit log
  await recordServerAuditLog({
    actorId: adminUid,
    actorRole: 'admin',
    action: 'ADMIN_REMOVED',
    resourceType: 'user_role',
    resourceId: targetUid,
    customerId: targetUid,
    details: `Revoked administrative privileges from user ${targetUid}`,
    result: 'SUCCESS',
  });

  return {
    success: true,
    message: `Administrative access revoked from user ${targetUid}`,
  };
}

export async function assignUserRoleServer(params: AssignRoleParams): Promise<{ success: boolean; message: string }> {
  const { targetUid, targetRole, adminUid, reason } = params;

  if (!adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not configured on server');
  }

  // 1. Authoritatively set Firebase Auth Custom Claims
  await adminAuth.setCustomUserClaims(targetUid, { role: targetRole, admin: targetRole === 'admin' });

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
    action: targetRole === 'admin' ? 'ADMIN_ADDED' : 'ADMIN_ASSIGN_ROLE',
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

  // Role always remains expert/doctor. Never convert an expert into a customer due to verification status!
  const targetRole: PlatformRole = 'expert';

  // 1. Set Custom Claims
  await adminAuth.setCustomUserClaims(doctorId, {
    role: targetRole,
    verificationStatus: status,
  });

  const now = new Date();
  const updatePayload: Record<string, any> = {
    verificationStatus: status,
    updatedAt: now,
  };

  if (status === 'verified') {
    updatePayload.verifiedAt = now;
    updatePayload.verifiedBy = adminUid;
    updatePayload.verificationNotes = notes || 'Approved by administrator';
  } else if (status === 'rejected') {
    updatePayload.rejectedAt = now;
    updatePayload.rejectedBy = adminUid;
    updatePayload.rejectionReason = notes || 'Credentials did not meet clinical verification criteria';
  } else if (status === 'suspended') {
    updatePayload.suspendedAt = now;
    updatePayload.suspendedBy = adminUid;
    updatePayload.suspensionReason = notes || 'Administrative suspension';
  } else if (status === 'pending' && notes) {
    updatePayload.correctionRequest = notes;
  }

  // 2. Update both /experts and /doctors collections for seamless cross-collection sync
  await Promise.all([
    adminDb.collection('experts').doc(doctorId).set(updatePayload, { merge: true }),
    adminDb.collection('doctors').doc(doctorId).set(updatePayload, { merge: true }),
    adminDb.collection('users').doc(doctorId).set({
      role: targetRole,
      verificationStatus: status,
      updatedAt: now,
    }, { merge: true }),
  ]);

  // 3. Determine audit action
  let auditAction = 'PRACTITIONER_UPDATED';
  if (status === 'verified') auditAction = 'PRACTITIONER_APPROVED';
  else if (status === 'rejected') auditAction = 'PRACTITIONER_REJECTED';
  else if (status === 'suspended') auditAction = 'PRACTITIONER_SUSPENDED';
  else if (notes && status === 'pending') auditAction = 'PRACTITIONER_CORRECTION_REQUESTED';

  // 4. Log Audit Event
  await recordServerAuditLog({
    actorId: adminUid,
    actorRole: 'admin',
    action: auditAction,
    resourceType: 'practitioner_profile',
    resourceId: doctorId,
    details: `Practitioner ${doctorName || doctorId} verification status set to '${status}'. Notes: ${notes || 'None'}`,
    result: 'SUCCESS',
  });

  return {
    success: true,
    message: `Practitioner ${doctorId} status updated to '${status}' with role preserved as '${targetRole}'`,
  };
}
