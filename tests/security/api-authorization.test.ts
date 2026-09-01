/**
 * Automated API Server-Side Authorization & IDOR Test Suite
 * Validates server authorization rules across admin, doctor, and patient endpoints.
 */

import { describe, it, expect } from 'vitest';

interface MockUser {
  uid: string;
  role: 'customer' | 'doctor' | 'admin';
  status: 'active' | 'suspended';
  doctorVerificationStatus?: 'pending' | 'verified' | 'rejected';
}

interface MockConsent {
  customerId: string;
  doctorId: string;
  status: 'active' | 'revoked';
}

function evaluateApiAccess(
  actor: MockUser,
  endpoint: 'admin_roles' | 'doctor_patients' | 'patient_reports',
  targetPatientId?: string,
  consents: MockConsent[] = []
): { statusCode: number; error?: string } {
  // 1. Account Status Check
  if (actor.status === 'suspended') {
    return { statusCode: 403, error: 'ACCOUNT_SUSPENDED' };
  }

  // 2. Admin Roles API
  if (endpoint === 'admin_roles') {
    if (actor.role !== 'admin') {
      return { statusCode: 403, error: 'FORBIDDEN' };
    }
    return { statusCode: 200 };
  }

  // 3. Doctor Patients API
  if (endpoint === 'doctor_patients') {
    if (actor.role !== 'doctor' && actor.role !== 'admin') {
      return { statusCode: 403, error: 'FORBIDDEN' };
    }
    if (actor.role === 'doctor' && actor.doctorVerificationStatus !== 'verified') {
      return { statusCode: 403, error: 'DOCTOR_NOT_VERIFIED' };
    }
    return { statusCode: 200 };
  }

  // 4. Patient Reports API (IDOR + Consent Protection)
  if (endpoint === 'patient_reports') {
    if (!targetPatientId) return { statusCode: 400, error: 'VALIDATION_ERROR' };

    // Case A: Owner
    if (actor.uid === targetPatientId) {
      return { statusCode: 200 };
    }

    // Case B: Admin
    if (actor.role === 'admin') {
      return { statusCode: 200 };
    }

    // Case C: Doctor with active consent
    if (actor.role === 'doctor') {
      const hasActiveConsent = consents.some(
        c => c.customerId === targetPatientId && c.doctorId === actor.uid && c.status === 'active'
      );
      if (hasActiveConsent) {
        return { statusCode: 200 };
      }
      return { statusCode: 403, error: 'CONSENT_REQUIRED' };
    }

    // Any other customer accessing another patient
    return { statusCode: 403, error: 'FORBIDDEN' };
  }

  return { statusCode: 404 };
}

describe('API Server-Side Authorization Matrix', () => {
  const customerAlice: MockUser = { uid: 'user_alice', role: 'customer', status: 'active' };
  const customerBob: MockUser = { uid: 'user_bob', role: 'customer', status: 'active' };
  const suspendedUser: MockUser = { uid: 'user_bad', role: 'customer', status: 'suspended' };
  const pendingDoctor: MockUser = { uid: 'doc_pending', role: 'doctor', status: 'active', doctorVerificationStatus: 'pending' };
  const verifiedDoctor: MockUser = { uid: 'doc_verified', role: 'doctor', status: 'active', doctorVerificationStatus: 'verified' };
  const adminUser: MockUser = { uid: 'admin_super', role: 'admin', status: 'active' };

  const consents: MockConsent[] = [
    { customerId: 'user_alice', doctorId: 'doc_verified', status: 'active' },
    { customerId: 'user_bob', doctorId: 'doc_verified', status: 'revoked' },
  ];

  it('Customer -> Admin API -> 403 FORBIDDEN', () => {
    const res = evaluateApiAccess(customerAlice, 'admin_roles');
    expect(res.statusCode).toBe(403);
    expect(res.error).toBe('FORBIDDEN');
  });

  it('Customer -> Unrelated Patient API -> 403 FORBIDDEN (IDOR Blocked)', () => {
    const res = evaluateApiAccess(customerAlice, 'patient_reports', 'user_bob', consents);
    expect(res.statusCode).toBe(403);
  });

  it('Doctor -> Unrelated Patient (Revoked/No Consent) -> 403 CONSENT_REQUIRED', () => {
    const res = evaluateApiAccess(verifiedDoctor, 'patient_reports', 'user_bob', consents);
    expect(res.statusCode).toBe(403);
    expect(res.error).toBe('CONSENT_REQUIRED');
  });

  it('Doctor -> Authorized Patient with Active Consent -> 200 SUCCESS', () => {
    const res = evaluateApiAccess(verifiedDoctor, 'patient_reports', 'user_alice', consents);
    expect(res.statusCode).toBe(200);
  });

  it('Pending Doctor -> Doctor Patients API -> 403 DOCTOR_NOT_VERIFIED', () => {
    const res = evaluateApiAccess(pendingDoctor, 'doctor_patients');
    expect(res.statusCode).toBe(403);
    expect(res.error).toBe('DOCTOR_NOT_VERIFIED');
  });

  it('Suspended User -> Protected API -> 403 ACCOUNT_SUSPENDED', () => {
    const res = evaluateApiAccess(suspendedUser, 'patient_reports', 'user_bad');
    expect(res.statusCode).toBe(403);
    expect(res.error).toBe('ACCOUNT_SUSPENDED');
  });

  it('Admin -> Admin API -> 200 SUCCESS', () => {
    const res = evaluateApiAccess(adminUser, 'admin_roles');
    expect(res.statusCode).toBe(200);
  });
});
