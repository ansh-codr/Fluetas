import { NextRequest } from 'next/server';
import { requireServerRole } from '@/lib/auth-guard';
import { assignUserRoleServer, PlatformRole } from '@/lib/server/roleManager';
import { apiSuccess, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 1. Authorize: Only authentic Admins can call this route
  const authCheck = await requireServerRole(request, ['admin']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { targetUid, role, reason } = body;

    if (!targetUid || !role) {
      return apiError('VALIDATION_ERROR', 'Missing targetUid or role', 400);
    }

    if (!['customer', 'doctor', 'admin'].includes(role)) {
      return apiError('INVALID_ROLE', 'Role must be customer, doctor, or admin', 400);
    }

    const result = await assignUserRoleServer({
      targetUid,
      targetRole: role as PlatformRole,
      adminUid: authCheck.user.uid,
      reason,
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    console.error('[API /api/admin/roles] Error:', err);
    return apiError('ROLE_ASSIGNMENT_FAILED', err?.message || 'Failed to update user role', 500);
  }
}
