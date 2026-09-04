/**
 * Doctor & Clinical Service
 * Powers doctor panel workflows: authorized patients, clinical notes, test requests, recommendations, follow-ups, and report reviews.
 */

import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { validateDoctorAccess, DoctorPatientRelationship } from './consentService';
export type { DoctorPatientRelationship };
import { logAuditEvent } from './auditService';
import { addTimelineEvent } from './timelineService';
import { createNotification } from './notificationService';
import { getUserProfile, getHealthProfile, UserProfile, HealthProfile } from './userService';
import { getRecentSymptoms, SymptomEntry } from './symptomService';

export interface TestRequest {
  id?: string;
  requestId: string;
  customerId: string;
  customerName?: string;
  doctorId: string;
  doctorName: string;
  consultationId?: string;
  testName: string;
  reason: string;
  instructions?: string;
  priority: 'Routine' | 'Urgent' | 'Stat';
  dueDate?: string;
  requestedAt: Timestamp;
  status: 'requested' | 'uploaded' | 'reviewed' | 'completed';
  uploadedReportId?: string;
}

export interface RecommendationRecord {
  id?: string;
  recommendationId: string;
  customerId: string;
  doctorId: string;
  doctorName: string;
  consultationId?: string;
  content: string[];
  createdAt: Timestamp;
  status: 'active' | 'superseded' | 'completed';
}

export interface FollowUpRecord {
  id?: string;
  followUpId: string;
  customerId: string;
  customerName?: string;
  doctorId: string;
  doctorName: string;
  consultationId?: string;
  date: string;
  purpose: string;
  notes?: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  createdAt: Timestamp;
}

export interface MedicalReportDoc {
  id?: string;
  documentId: string;
  customerId: string;
  customerName?: string;
  documentType: 'Lab Test' | 'Prescription' | 'MRI/X-Ray' | 'Discharge Summary' | 'Other';
  name: string;
  fileUrl?: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
  consultationId?: string;
  doctorId?: string;
  doctorName?: string;
  testRequestId?: string;
  testName?: string;
  status: 'uploaded' | 'reviewed' | 'pending_review';
  notes?: string;
  doctorReview?: {
    reviewedAt: Timestamp;
    reviewerDoctorId: string;
    reviewerDoctorName: string;
    findings: string;
    recommendations?: string;
    followUpRequired: boolean;
  };
}

export interface AuthorizedPatientData {
  relationship: DoctorPatientRelationship;
  userProfile: UserProfile | null;
  healthProfile: HealthProfile | null;
  symptoms: SymptomEntry[];
  permissions: Record<string, boolean>;
  unauthorizedScopes: string[];
}

/**
 * Retrieves only patients with an active, authorized relationship with this doctor.
 * Explicitly DOES NOT browse all users in the system.
 */
export async function getAuthorizedPatientsForDoctor(doctorId: string): Promise<DoctorPatientRelationship[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'doctorPatientRelationships'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DoctorPatientRelationship));
  } catch (err) {
    console.warn('[DoctorService] getAuthorizedPatients error:', err);
    return [];
  }
}

/**
 * Retrieves patient medical data strictly filtered by active consent scopes.
 */
export async function getPatientAuthorizedHealthData(
  doctorId: string,
  patientId: string
): Promise<{ authorized: boolean; data: AuthorizedPatientData | null; reason?: string }> {
  const check = await validateDoctorAccess(doctorId, patientId);
  if (!check.authorized || !check.consent) {
    return { authorized: false, data: null, reason: check.reason || 'Not authorized by patient consent' };
  }

  const permissions = check.consent.permissions || {};
  const unauthorizedScopes: string[] = [];

  let userProfile: UserProfile | null = null;
  let healthProfile: HealthProfile | null = null;
  let symptoms: SymptomEntry[] = [];

  // Health Profile scope
  if (permissions.health_profile !== false) {
    userProfile = await getUserProfile(patientId);
  } else {
    unauthorizedScopes.push('Basic Health Profile');
  }

  // Medical History & Medications scope
  if (permissions.medical_history !== false) {
    healthProfile = await getHealthProfile(patientId);
  } else {
    unauthorizedScopes.push('Medical History & Medications');
  }

  // Symptoms scope
  if (permissions.consultations !== false) {
    symptoms = await getRecentSymptoms(patientId, 10);
  }

  // Log clinical view in audit trail
  await logAuditEvent({
    actorId: doctorId,
    actorRole: 'doctor',
    action: 'doctor_viewed_patient_record',
    resourceType: 'health_record',
    resourceId: patientId,
    customerId: patientId,
    patientName: userProfile?.name || 'Patient',
    details: 'Viewed authorized patient clinical overview',
    result: 'SUCCESS',
  });

  const relationship: DoctorPatientRelationship = {
    relationshipId: `rel_${doctorId}_${patientId}`,
    doctorId,
    customerId: patientId,
    customerName: userProfile?.name || 'Patient',
    consentId: check.consent.consentId,
    status: 'active',
    createdAt: check.consent.grantedAt,
    updatedAt: Timestamp.now(),
  };

  return {
    authorized: true,
    data: {
      relationship,
      userProfile,
      healthProfile,
      symptoms,
      permissions,
      unauthorizedScopes,
    },
  };
}

/**
 * Creates a structured diagnostic test / lab report request.
 */
export async function createTestRequest(data: {
  doctorId: string;
  doctorName: string;
  customerId: string;
  customerName?: string;
  consultationId?: string;
  testName: string;
  reason: string;
  instructions?: string;
  priority?: 'Routine' | 'Urgent' | 'Stat';
  dueDate?: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const now = Timestamp.now();
  const requestId = `test_req_${Date.now()}`;

  const req: TestRequest = {
    requestId,
    doctorId: data.doctorId,
    doctorName: data.doctorName,
    customerId: data.customerId,
    customerName: data.customerName,
    consultationId: data.consultationId,
    testName: data.testName,
    reason: data.reason,
    instructions: data.instructions,
    priority: data.priority || 'Routine',
    dueDate: data.dueDate,
    requestedAt: now,
    status: 'requested',
  };

  await setDoc(doc(db, 'testRequests', requestId), req);
  await setDoc(doc(db, 'users', data.customerId, 'testRequests', requestId), req);

  // Timeline & Notification
  await addTimelineEvent(data.customerId, {
    type: 'test_requested',
    title: `Diagnostic Test Requested: ${data.testName}`,
    description: `Ordered by ${data.doctorName} · Priority: ${data.priority || 'Routine'}`,
    category: 'Clinical',
    badge: 'Test Ordered',
    relatedId: requestId,
  });

  await createNotification(data.customerId, {
    type: 'test_requested',
    title: `Lab Test Ordered: ${data.testName}`,
    message: `${data.doctorName} has requested a diagnostic test: ${data.testName}. You can upload the report once completed.`,
    relatedResourceType: 'testRequest',
    relatedResourceId: requestId,
  });

  await logAuditEvent({
    actorId: data.doctorId,
    actorRole: 'doctor',
    action: 'doctor_requested_test',
    resourceType: 'test_request',
    resourceId: requestId,
    customerId: data.customerId,
    details: `Ordered diagnostic test: ${data.testName}`,
    result: 'SUCCESS',
  });

  return requestId;
}

/**
 * Creates an immutable doctor recommendation record.
 */
export async function createRecommendation(data: {
  doctorId: string;
  doctorName: string;
  customerId: string;
  consultationId?: string;
  content: string[];
}): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const now = Timestamp.now();
  const recommendationId = `rec_${Date.now()}`;

  const rec: RecommendationRecord = {
    recommendationId,
    doctorId: data.doctorId,
    doctorName: data.doctorName,
    customerId: data.customerId,
    consultationId: data.consultationId,
    content: data.content,
    createdAt: now,
    status: 'active',
  };

  await setDoc(doc(db, 'recommendations', recommendationId), rec);
  await setDoc(doc(db, 'users', data.customerId, 'recommendations', recommendationId), rec);

  await addTimelineEvent(data.customerId, {
    type: 'recommendation_added',
    title: `Clinical Recommendations Updated`,
    description: `${data.doctorName} added ${data.content.length} actionable health directives.`,
    category: 'Clinical',
    badge: 'Recommendations',
    relatedId: recommendationId,
  });

  await createNotification(data.customerId, {
    type: 'recommendation_added',
    title: 'New Doctor Recommendation',
    message: `${data.doctorName} has added recommendations to your health plan.`,
    relatedResourceType: 'recommendation',
    relatedResourceId: recommendationId,
  });

  await logAuditEvent({
    actorId: data.doctorId,
    actorRole: 'doctor',
    action: 'doctor_added_recommendation',
    resourceType: 'recommendation',
    resourceId: recommendationId,
    customerId: data.customerId,
    details: 'Appended new medical recommendation directive',
    result: 'SUCCESS',
  });

  return recommendationId;
}

/**
 * Schedules a doctor-patient follow-up.
 */
export async function createFollowUp(data: {
  doctorId: string;
  doctorName: string;
  customerId: string;
  customerName?: string;
  consultationId?: string;
  date: string;
  purpose: string;
  notes?: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase not configured');

  const now = Timestamp.now();
  const followUpId = `fu_${Date.now()}`;

  const fu: FollowUpRecord = {
    followUpId,
    doctorId: data.doctorId,
    doctorName: data.doctorName,
    customerId: data.customerId,
    customerName: data.customerName,
    consultationId: data.consultationId,
    date: data.date,
    purpose: data.purpose,
    notes: data.notes,
    status: 'Pending',
    createdAt: now,
  };

  await setDoc(doc(db, 'followUps', followUpId), fu);
  await setDoc(doc(db, 'users', data.customerId, 'followUps', followUpId), fu);

  await addTimelineEvent(data.customerId, {
    type: 'followup_scheduled',
    title: `Follow-up Scheduled for ${data.date}`,
    description: `${data.purpose} with ${data.doctorName}`,
    category: 'Clinical',
    badge: 'Follow-up',
    relatedId: followUpId,
  });

  await createNotification(data.customerId, {
    type: 'followup_scheduled',
    title: 'Clinical Follow-up Scheduled',
    message: `Follow-up scheduled with ${data.doctorName} on ${data.date} for ${data.purpose}.`,
    relatedResourceType: 'followUp',
    relatedResourceId: followUpId,
  });

  await logAuditEvent({
    actorId: data.doctorId,
    actorRole: 'doctor',
    action: 'doctor_scheduled_follow_up',
    resourceType: 'follow_up',
    resourceId: followUpId,
    customerId: data.customerId,
    details: `Scheduled follow-up on ${data.date}`,
    result: 'SUCCESS',
  });

  return followUpId;
}

/**
 * Doctor submits clinical review on uploaded patient diagnostic report.
 */
export async function reviewMedicalReport(data: {
  doctorId: string;
  doctorName: string;
  reportId: string;
  customerId: string;
  reportName: string;
  findings: string;
  recommendations?: string;
  followUpRequired: boolean;
}): Promise<void> {
  if (!db) throw new Error('Firebase not configured');

  const now = Timestamp.now();
  const reviewData = {
    reviewedAt: now,
    reviewerDoctorId: data.doctorId,
    reviewerDoctorName: data.doctorName,
    findings: data.findings,
    recommendations: data.recommendations,
    followUpRequired: data.followUpRequired,
  };

  // Update in root reports collection
  await updateDoc(doc(db, 'medicalReports', data.reportId), {
    status: 'reviewed',
    doctorReview: reviewData,
  });

  // Update in user subcollection
  try {
    await updateDoc(doc(db, 'users', data.customerId, 'reports', data.reportId), {
      status: 'reviewed',
      doctorReview: reviewData,
    });
  } catch {
    // ignore
  }

  // Update timeline
  await addTimelineEvent(data.customerId, {
    type: 'report_reviewed',
    title: `Medical Report Reviewed: ${data.reportName}`,
    description: `Reviewed by ${data.doctorName} · Findings recorded`,
    category: 'Clinical',
    badge: 'Reviewed',
    relatedId: data.reportId,
  });

  // Customer notification
  await createNotification(data.customerId, {
    type: 'report_reviewed',
    title: `Report Reviewed: ${data.reportName}`,
    message: `${data.doctorName} has reviewed your report and added clinical findings.`,
    relatedResourceType: 'medicalReport',
    relatedResourceId: data.reportId,
  });

  // Audit log
  await logAuditEvent({
    actorId: data.doctorId,
    actorRole: 'doctor',
    action: 'doctor_reviewed_report',
    resourceType: 'medical_report',
    resourceId: data.reportId,
    customerId: data.customerId,
    details: `Completed review for report: ${data.reportName}`,
    result: 'SUCCESS',
  });
}

export interface VerifiedExpert {
  id: string;
  name: string;
  professionalRole: string;
  specialization: string;
  qualification: string;
  experience: string;
  bio: string;
  languages: string[];
  consultationType?: string;
  durationMinutes?: number;
  workingDays?: string[];
  workingHours?: { start: string; end: string };
  avatarInitials: string;
  avatarColor: string;
  verificationStatus: string;
  focusAreas?: string[];
  department?: string;
  affiliation?: string;
}

export const DR_SWATI_DIXIT: VerifiedExpert = {
  id: 'dr_swati_dixit',
  name: 'Dr. Swati Dixit',
  professionalRole: 'HOD & Senior Clinical Biochemist',
  specialization: "Women's Health & Biochemistry",
  qualification: 'PhD Biochemistry (AMU Rank 1), Post-Doc (Lanzhou Univ), ICMR SRF',
  experience: '9+ yrs',
  bio: 'Head of Department, Medical Lab Technology at Sanskriti University. Specialist in Women’s Hormonal & Endocrine Health, Metabolic Pathways, Cellular Diagnostics, and Clinical Biochemistry. Former Post-Doctoral Researcher at Lanzhou University and ICMR Senior Research Fellow. Dedicated to providing a safe, confidential space for women to discuss hormonal balance, menstrual/cycle health, metabolism, and diagnostic test reports.',
  languages: ['English', 'Hindi', 'Chinese', 'Spanish'],
  consultationType: '1-on-1 Confidential Telehealth & Review',
  durationMinutes: 30,
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  workingHours: { start: '10:00', end: '19:00' },
  avatarInitials: 'SD',
  avatarColor: '#0F766E',
  verificationStatus: 'verified',
  focusAreas: [
    "Women's Hormonal Health",
    'PCOS / PCOD & Cycle Regularity',
    'Thyroid & Metabolic Wellness',
    'Clinical Lab & Blood Reports',
    'Cellular Health & Toxicology',
  ],
  department: 'Medical Lab Technology, School of Medical & Allied Sciences',
  affiliation: 'Sanskriti University, Mathura',
};

const AVATAR_COLORS = ['#0F766E', '#2E7D32', '#2E6DA4', '#7A4E9E', '#D97706', '#C23B6B'];

/**
 * Retrieves all verified practitioners and specialists from the database.
 * Always includes verified clinical staff such as Dr. Swati Dixit.
 */
export async function getVerifiedExperts(): Promise<VerifiedExpert[]> {
  if (!db) return [DR_SWATI_DIXIT];

  try {
    const [expertsSnap, docsSnap] = await Promise.all([
      getDocs(query(collection(db, 'experts'), where('verificationStatus', '==', 'verified'))),
      getDocs(query(collection(db, 'doctors'), where('verificationStatus', '==', 'verified'))),
    ]);

    const results: VerifiedExpert[] = [];
    const seenIds = new Set<string>();

    // Always include Dr. Swati Dixit for Women's Health & Biochemistry consultations
    results.push(DR_SWATI_DIXIT);
    seenIds.add(DR_SWATI_DIXIT.id);

    expertsSnap.docs.forEach((d, idx) => {
      if (seenIds.has(d.id)) return;
      seenIds.add(d.id);
      const data = d.data();
      const initials = (data.name || 'Dr')
        .replace('Dr. ', '')
        .split(' ')
        .map((p: string) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      results.push({
        id: d.id,
        name: data.name || 'Practitioner',
        professionalRole: data.professionalRole || 'Specialist',
        specialization: data.specialization || 'Clinical Specialist',
        qualification: data.qualification || 'Certified Clinical Practitioner',
        experience: data.experience || '3+ yrs',
        bio: data.bio || '',
        languages: Array.isArray(data.languages) ? data.languages : ['English'],
        consultationType: data.consultationType || '1-on-1 Encrypted Telehealth',
        durationMinutes: data.durationMinutes || 30,
        workingDays: Array.isArray(data.workingDays) ? data.workingDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workingHours: data.workingHours || { start: '09:00', end: '17:00' },
        avatarInitials: initials || 'EX',
        avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        verificationStatus: 'verified',
        focusAreas: Array.isArray(data.focusAreas) ? data.focusAreas : undefined,
      });
    });

    docsSnap.docs.forEach((d, idx) => {
      if (!seenIds.has(d.id)) {
        seenIds.add(d.id);
        const data = d.data();
        const initials = (data.name || 'Dr')
          .replace('Dr. ', '')
          .split(' ')
          .map((p: string) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        results.push({
          id: d.id,
          name: data.name || 'Dr. Specialist',
          professionalRole: 'DOCTOR',
          specialization: data.specialization || 'Clinical Medicine',
          qualification: data.credentials || 'MD / MBBS',
          experience: data.experience || '5+ yrs',
          bio: data.bio || '',
          languages: ['English', 'Hindi'],
          consultationType: '1-on-1 Encrypted Telehealth',
          durationMinutes: 30,
          workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          workingHours: { start: '10:00', end: '18:00' },
          avatarInitials: initials || 'DR',
          avatarColor: AVATAR_COLORS[(idx + 3) % AVATAR_COLORS.length],
          verificationStatus: 'verified',
          focusAreas: Array.isArray(data.focusAreas) ? data.focusAreas : undefined,
        });
      }
    });

    return results;
  } catch (err) {
    console.warn('[DoctorService] getVerifiedExperts error:', err);
    return [DR_SWATI_DIXIT];
  }
}

/**
 * Retrieves all diagnostic reports and medical records uploaded for a customer.
 */
export async function getCustomerMedicalReports(userId: string): Promise<MedicalReportDoc[]> {
  if (!db || !userId) return [];
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'documents'));
    const list = snap.docs.map(d => ({ id: d.id, documentId: d.id, ...d.data() } as MedicalReportDoc));
    return list.sort((a, b) => (b.uploadedAt?.seconds || 0) - (a.uploadedAt?.seconds || 0));
  } catch (err) {
    console.warn('[DoctorService] getCustomerMedicalReports error:', err);
    return [];
  }
}

/**
 * Uploads medical report metadata to user's documents subcollection and root medicalReports.
 */
export async function uploadMedicalReport(data: {
  userId: string;
  userName: string;
  documentType: 'Lab Test' | 'Prescription' | 'MRI/X-Ray' | 'Discharge Summary' | 'Other';
  name: string;
  fileUrl?: string;
  notes?: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const now = Timestamp.now();
  const docRef = doc(collection(db, 'users', data.userId, 'documents'));
  const reportDoc: MedicalReportDoc = {
    documentId: docRef.id,
    id: docRef.id,
    customerId: data.userId,
    customerName: data.userName,
    documentType: data.documentType,
    name: data.name,
    fileUrl: data.fileUrl || '',
    uploadedAt: now,
    uploadedBy: data.userName,
    status: 'uploaded',
    notes: data.notes || '',
  };

  await setDoc(docRef, reportDoc);
  await setDoc(doc(db, 'medicalReports', docRef.id), reportDoc);

  await addTimelineEvent(data.userId, {
    type: 'report_uploaded',
    title: `Document Uploaded: ${data.name}`,
    description: `${data.documentType} record uploaded for clinical review.`,
    category: 'Clinical',
    badge: 'Uploaded',
    relatedId: docRef.id,
  });

  return docRef.id;
}


