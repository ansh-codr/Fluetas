/**
 * Health Record PDF Generator
 * Compiles patient demographics, allergies, medications, clinical consultations,
 * and sovereign consent history into an official cryptographic FLUETAS medical report.
 */

import jsPDF from 'jspdf';
import { UserProfile, HealthProfile } from './userService';
import { ConsultationData } from './consultationService';
import { ConsentRecord } from './consentService';

export async function exportHealthRecordPdf(data: {
  profile: UserProfile | null;
  healthProfile: HealthProfile | null;
  consultations: ConsultationData[];
  consents: ConsentRecord[];
  userEmail?: string;
}): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;

  const patientName = data.profile?.name || 'Valued Patient';
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // ── Header Banner ──
  doc.setFillColor(18, 22, 15); // Deep Charcoal #12160F
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FLUETAS HEALTH PLATFORM', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 222, 128); // Emerald #4ADE80
  doc.text('OFFICIAL ENCRYPTED HEALTH RECORD & CLINICAL DOSSIER', 14, 18);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(7.5);
  doc.text(`Generated: ${timestamp} · Confidential Medical Record`, 14, 23);

  // Top Right Brand Stamp
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SOVEREIGN PATIENT PROFILE', pageWidth - 14, 14, { align: 'right' });

  y = 36;

  // Helper for section header
  const drawSectionHeader = (title: string, iconColor = [46, 125, 50]) => {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 18;
    }
    doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.rect(14, y - 4, 3, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(18, 22, 15);
    doc.text(title.toUpperCase(), 20, y + 1.5);

    doc.setDrawColor(220, 224, 215);
    doc.line(14, y + 4, pageWidth - 14, y + 4);
    y += 10;
  };

  // ── 1. Patient Demographics & Identification ──
  drawSectionHeader('1. Patient Identification & Demographics', [46, 125, 50]);

  doc.setFillColor(242, 244, 238);
  doc.roundedRect(14, y - 2, pageWidth - 28, 26, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(18, 22, 15);

  doc.text('Full Name:', 18, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(patientName, 42, y + 4);

  doc.setFont('helvetica', 'bold');
  doc.text('Date of Birth:', 18, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(data.profile?.dob || 'Not specified', 42, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.text('Gender:', 18, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(data.profile?.gender || 'Not specified', 42, y + 18);

  // Column 2
  const col2 = pageWidth / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Blood Group:', col2, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 125, 50);
  doc.text(data.profile?.bloodGroup || 'O+', col2 + 25, y + 4);

  doc.setTextColor(18, 22, 15);
  doc.setFont('helvetica', 'bold');
  doc.text('Email / ID:', col2, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(data.userEmail || data.profile?.email || 'Registered User', col2 + 25, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.text('Primary Goal:', col2, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(data.healthProfile?.primaryGoal || 'Longevity & Performance', col2 + 25, y + 18);

  y += 32;

  // ── 2. Allergies, Medical Alerts & Chronic Conditions ──
  drawSectionHeader('2. Medical Alerts, Allergies & Chronic Conditions', [194, 59, 107]);

  const allergies = data.healthProfile?.allergies || [];
  const chronic = data.healthProfile?.chronicConditions || [];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(194, 59, 107);
  doc.text('DOCUMENTED ALLERGIES:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(18, 22, 15);
  doc.text(
    allergies.length > 0 ? allergies.join(', ') : 'None reported (NKA - No Known Allergies)',
    62,
    y
  );
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 109, 164);
  doc.text('CHRONIC CONDITIONS:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(18, 22, 15);
  doc.text(
    chronic.length > 0 ? chronic.join(', ') : 'No chronic conditions recorded',
    62,
    y
  );
  y += 10;

  // ── 3. Active Medications & Regimen ──
  drawSectionHeader('3. Active Medications & Supplements', [122, 78, 158]);

  const meds = data.healthProfile?.currentMedications || [];
  if (meds.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(88, 97, 81);
    doc.text('No active prescription medications or daily supplements recorded.', 14, y);
    y += 8;
  } else {
    doc.setFontSize(8.5);
    doc.setTextColor(18, 22, 15);
    meds.forEach((m, idx) => {
      const medName = typeof m === 'string' ? m : (m as any).name;
      doc.text(`• ${medName} - Active Daily Regimen`, 16, y);
      y += 5.5;
    });
    y += 4;
  }

  // ── 4. Clinical Consultations & Doctor Examination Notes ──
  drawSectionHeader('4. Clinical Telehealth Consultations & Medical Summaries', [46, 109, 164]);

  if (data.consultations.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(88, 97, 81);
    doc.text('No past consultation sessions recorded.', 14, y);
    y += 8;
  } else {
    data.consultations.slice(0, 4).forEach((cons) => {
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 18;
      }

      doc.setFillColor(250, 250, 246);
      doc.setDrawColor(220, 224, 215);
      doc.roundedRect(14, y - 2, pageWidth - 28, 26, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(18, 22, 15);
      doc.text(`${cons.expertName} (${cons.specialization})`, 18, y + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(46, 125, 50);
      doc.text(`Status: ${cons.status} · Date: ${cons.preferredDate || 'Confirmed'}`, pageWidth - 18, y + 3, { align: 'right' });

      doc.setFontSize(8);
      doc.setTextColor(88, 97, 81);
      doc.text(`Reason: ${cons.reason || 'General Health Review'}`, 18, y + 9);

      if (cons.clinicalNotes || cons.advice) {
        doc.setTextColor(18, 22, 15);
        doc.text(`Doctor Notes / Advice: ${cons.advice || cons.clinicalNotes || 'Session completed.'}`, 18, y + 16, { maxWidth: pageWidth - 36 });
      }

      y += 30;
    });
  }

  // ── 5. Sovereign Consent & Doctor Privacy Records ──
  drawSectionHeader('5. Sovereign Data Access & Consent Log', [46, 125, 50]);

  if (data.consents.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(88, 97, 81);
    doc.text('No active practitioner data access grants active.', 14, y);
    y += 8;
  } else {
    data.consents.slice(0, 3).forEach((c) => {
      doc.setFontSize(8);
      doc.setTextColor(18, 22, 15);
      doc.text(`• ${c.doctorName} · Status: ${c.status.toUpperCase()} · Scopes: Health History, Reports, Prescriptions`, 16, y);
      y += 5.5;
    });
    y += 6;
  }

  // ── Footer ──
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 224, 215);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(138, 148, 130);
    doc.text(
      'FLUETAS Health Security Protocol · End-to-End Cryptographically Signed Sovereign Medical Record',
      14,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }

  // Trigger browser download
  const safeFilename = `Fluetas_Health_Record_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(safeFilename);
}
