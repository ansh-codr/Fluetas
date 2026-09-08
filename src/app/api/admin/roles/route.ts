import { NextRequest } from 'next/server';
import { requireServerRole } from '@/lib/auth-guard';
import {
  assignUserRoleServer,
  addAdminByEmailServer,
  removeAdminServer,
  PlatformRole,
} from '@/lib/server/roleManager';
import { apiSuccess, apiError } from '@/lib/api-response';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireServerRole(request, ['admin']);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    if (!adminDb) {
      return apiError('SERVER_ERROR', 'Firebase Admin not configured', 500);
    }
    const snap = await adminDb.collection('users').where('role', '==', 'admin').get();
    const admins = snap.docs.map(d => ({
      id: d.id,
      name: d.data().name || 'Administrator',
      email: d.data().email || '',
      role: 'admin',
      status: d.data().status || 'active',
      roleUpdatedAt: d.data().roleUpdatedAt || null,
    }));
    return apiSuccess({ administrators: admins });
  } catch (err: any) {
    console.error('[API /api/admin/roles GET] Unhandled error:', err);
    return apiError('FETCH_FAILED', err?.message || 'Failed to list administrators', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authorize: Only authentic Admins can call this route
    const authCheck = await requireServerRole(request, ['admin']);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const body = await request.json();
    const { action, email, targetUid, role, reason } = body;

    // Action 1: Add Administrator by Email
    if (action === 'ADD_ADMIN_BY_EMAIL') {
      if (!email || typeof email !== 'string') {
        return apiError('VALIDATION_ERROR', 'A valid email address is required', 400);
      }
      try {
        const result = await addAdminByEmailServer(email, authCheck.user.uid);
        return apiSuccess(result, 200);
      } catch (err: any) {
        if (err.message === 'User account not found.') {
          return apiError('USER_NOT_FOUND', 'User account not found.', 404);
        }
        return apiError('OPERATION_FAILED', err?.message || 'Failed to add administrator', 400);
      }
    }

    // Action 2: Remove Administrator
    if (action === 'REMOVE_ADMIN') {
      if (!targetUid) {
        return apiError('VALIDATION_ERROR', 'Missing targetUid', 400);
      }
      try {
        const result = await removeAdminServer(targetUid, authCheck.user.uid);
        return apiSuccess(result, 200);
      } catch (err: any) {
        return apiError('OPERATION_FAILED', err?.message || 'Failed to revoke administrator', 400);
      }
    }

    // Default Action: Explicit Role Assignment
    if (!targetUid || !role) {
      return apiError('VALIDATION_ERROR', 'Missing targetUid or role', 400);
    }

    if (!['customer', 'doctor', 'expert', 'admin'].includes(role)) {
      return apiError('INVALID_ROLE', 'Role must be customer, doctor, expert, or admin', 400);
    }

    const result = await assignUserRoleServer({
      targetUid,
      targetRole: role as PlatformRole,
      adminUid: authCheck.user.uid,
      reason,
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    console.error('[API /api/admin/roles POST] Unhandled error:', err);
    return apiError('ROLE_ASSIGNMENT_FAILED', err?.message || 'Failed to update user role', 500);
  }
}
