import { NextRequest } from 'next/server';
import { requireServerRole } from '@/lib/auth-guard';
import { adminDb } from '@/lib/firebase-admin';
import { apiSuccess, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. Authorize: Only authentic DOCTOR or ADMIN can call this route
  const authCheck = await requireServerRole(request, ['doctor', 'admin']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const doctorUid = authCheck.user.uid;

  if (!adminDb) {
    return apiError('SERVER_CONFIG_ERROR', 'Firestore Admin is not configured', 500);
  }

  try {
    // 2. Fetch doctor profile to verify active/verified status
    const doctorDoc = await adminDb.collection('doctors').doc(doctorUid).get();
    const doctorData = doctorDoc.data();

    if (authCheck.user.role === 'doctor' && doctorData?.verificationStatus !== 'verified' && doctorData?.verificationStatus !== undefined) {
      return apiError('DOCTOR_NOT_VERIFIED', 'Your clinical credentials are still pending administrative verification', 403);
    }

    // 3. Query ONLY patients with active relationship/consent to this doctor
    const relationshipsSnap = await adminDb
      .collection('doctorPatientRelationships')
      .where('doctorId', '==', doctorUid)
      .where('status', '==', 'active')
      .get();

    const patients = relationshipsSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    return apiSuccess({ doctorId: doctorUid, patients, total: patients.length }, 200);
  } catch (err: any) {
    console.error('[API /api/doctor/patients] Error:', err);
    return apiError('DATA_FETCH_ERROR', 'Failed to retrieve authorized patient list', 500);
  }
}
