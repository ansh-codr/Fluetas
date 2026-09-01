import { NextRequest } from 'next/server';
import { requireServerRole } from '@/lib/auth-guard';
import { verifyDoctorAccountServer } from '@/lib/server/roleManager';
import { apiSuccess, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 1. Authorize: Only authentic Admins can verify doctors
  const authCheck = await requireServerRole(request, ['admin']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { doctorId, doctorName, status, notes } = body;

    if (!doctorId || !status) {
      return apiError('VALIDATION_ERROR', 'Missing doctorId or status', 400);
    }

    if (!['verified', 'rejected', 'suspended'].includes(status)) {
      return apiError('INVALID_STATUS', 'Status must be verified, rejected, or suspended', 400);
    }

    const result = await verifyDoctorAccountServer({
      doctorId,
      doctorName,
      status,
      adminUid: authCheck.user.uid,
      notes,
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    console.error('[API /api/admin/verify-doctor] Error:', err);
    return apiError('VERIFICATION_FAILED', err?.message || 'Failed to update doctor verification', 500);
  }
}
