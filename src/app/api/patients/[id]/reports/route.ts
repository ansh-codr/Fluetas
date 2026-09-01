import { NextRequest } from 'next/server';
import { verifyServerSession } from '@/lib/auth-guard';
import { adminDb } from '@/lib/firebase-admin';
import { apiSuccess, apiError } from '@/lib/api-response';
import { recordServerAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyServerSession(request);
  if (!session.authenticated) {
    return session.response;
  }

  const { id: targetPatientId } = await context.params;
  const actor = session.user;

  if (!targetPatientId) {
    return apiError('VALIDATION_ERROR', 'Patient ID is required', 400);
  }

  if (!adminDb) {
    return apiError('SERVER_CONFIG_ERROR', 'Firestore Admin is not configured', 500);
  }

  // IDOR & Consent Authorization Logic:
  // Case A: Customer requesting their own reports
  const isOwner = actor.uid === targetPatientId;

  // Case B: Admin requesting reports
  const isAdmin = actor.role === 'admin';

  // Case C: Doctor requesting patient reports -> Must have valid, non-revoked consent
  let hasConsent = false;

  if (!isOwner && !isAdmin) {
    if (actor.role !== 'doctor') {
      return apiError('FORBIDDEN', 'Access denied. You cannot view this patient records.', 403);
    }

    // Verify active doctor-patient relationship and valid consent
    const consentSnap = await adminDb
      .collection('consents')
      .where('customerId', '==', targetPatientId)
      .where('doctorId', '==', actor.uid)
      .where('status', '==', 'active')
      .get();

    hasConsent = !consentSnap.empty;

    if (!hasConsent) {
      await recordServerAuditLog({
        actorId: actor.uid,
        actorRole: 'doctor',
        action: 'UNAUTHORIZED_REPORT_ACCESS_ATTEMPT',
        resourceType: 'medical_reports',
        customerId: targetPatientId,
        details: `Doctor attempted to access reports for patient ${targetPatientId} without active consent.`,
        result: 'DENIED',
      });

      return apiError('CONSENT_REQUIRED', 'Access denied. Patient consent is not granted or has been revoked.', 403);
    }
  }

  try {
    // Fetch patient reports
    const reportsSnap = await adminDb
      .collection('medicalReports')
      .where('customerId', '==', targetPatientId)
      .get();

    const reports = reportsSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // Audit log access by doctor or admin
    if (!isOwner) {
      await recordServerAuditLog({
        actorId: actor.uid,
        actorRole: actor.role,
        action: 'PATIENT_REPORTS_ACCESSED',
        resourceType: 'medical_reports',
        customerId: targetPatientId,
        details: `Accessed ${reports.length} reports for patient ${targetPatientId}`,
        result: 'SUCCESS',
      });
    }

    return apiSuccess({ patientId: targetPatientId, reports, total: reports.length }, 200);
  } catch (err: any) {
    console.error(`[API /api/patients/${targetPatientId}/reports] Error:`, err);
    return apiError('DATA_FETCH_ERROR', 'Failed to retrieve patient medical reports', 500);
  }
}
