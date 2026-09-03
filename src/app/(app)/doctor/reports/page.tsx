'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { reviewMedicalReport } from '@/lib/services/doctorService';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Loader2,
  Calendar,
  User,
  Check,
} from 'lucide-react';

const mockUploadedReports = [
  {
    id: 'report_demo_1',
    customerId: 'patient_demo_rahul',
    customerName: 'Rahul Mehta',
    documentType: 'Lab Test',
    name: 'Comprehensive Metabolic & Vitamin D Panel',
    uploadedAt: '28 Aug 2026',
    status: 'pending_review',
    testName: 'Vitamin D (25-OH) & CMP',
    summaryText: 'Serum 25-OH Vitamin D: 18.2 ng/mL (Sub-optimal). Serum Calcium: 9.4 mg/dL. Creatinine: 1.0 mg/dL. Total Protein: 7.2 g/dL.',
  },
  {
    id: 'report_demo_2',
    customerId: 'patient_demo_rahul',
    customerName: 'Rahul Mehta',
    documentType: 'MRI/X-Ray',
    name: '3T MRI Right Shoulder Scapular Plane',
    uploadedAt: '22 Aug 2026',
    status: 'reviewed',
    testName: '3T MRI Right Shoulder',
    summaryText: 'Mild subacromial bursitis without full-thickness rotator cuff tear. Intact supraspinatus tendon.',
  },
];

export default function DoctorReportsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  const [selectedReport, setSelectedReport] = useState<any | null>(mockUploadedReports[0]);
  const [findings, setFindings] = useState('Patient exhibits sub-optimal Vitamin D (18.2 ng/mL) with normal electrolyte and kidney function parameters.');
  const [recommendations, setRecommendations] = useState('Initiate Cholecalciferol (Vitamin D3) 60,000 IU weekly for 8 weeks with healthy dietary fats. Re-test serum level in 2 months.');
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [reviewState, setReviewState] = useState<'idle' | 'submitting' | 'completed'>('idle');

  const doctorId = user?.uid || '';
  const doctorName = user?.displayName || 'Clinical Practitioner';

  const handleSaveReview = async () => {
    if (!selectedReport || !doctorId) return;
    setReviewState('submitting');
    try {
      await reviewMedicalReport({
        doctorId,
        doctorName,
        reportId: selectedReport.id,
        customerId: selectedReport.customerId,
        reportName: selectedReport.name,
        findings,
        recommendations,
        followUpRequired,
      });

      selectedReport.status = 'reviewed';
      setReviewState('completed');
      success('Report Marked as Reviewed', `Clinical findings recorded and appended to ${selectedReport.customerName}'s timeline.`);

      setTimeout(() => {
        setReviewState('idle');
      }, 3000);
    } catch (err) {
      alert('Failed to save review');
      setReviewState('idle');
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={20} className="text-[#FBBF24]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              PATIENT DIAGNOSTIC LABS &amp; REPORTS
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Encrypted document viewer &amp; clinical findings verification engine.
          </p>
        </div>
      </div>

      {/* Reports Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Report List */}
        <div className="flex flex-col gap-3">
          <span className="section-title">DIAGNOSTIC DOCUMENTS ({mockUploadedReports.length})</span>

          {mockUploadedReports.map(rep => {
            const isSelected = selectedReport?.id === rep.id;
            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`fluetas-card-interactive p-4 flex flex-col gap-2 cursor-pointer transition-all ${
                  isSelected ? 'border-[#FBBF24] bg-[#13161F] shadow-[0_0_15px_rgba(251,191,36,0.15)]' : 'hover:border-[#2A3050]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-bold text-[#8B91B0] uppercase">
                    {rep.documentType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[0.6rem] font-bold ${
                      rep.status === 'reviewed'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'bg-[#FBBF24]/15 text-[#FBBF24]'
                    }`}
                  >
                    {rep.status === 'reviewed' ? '✓ Reviewed' : 'Review Pending'}
                  </span>
                </div>

                <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0 line-clamp-2">
                  {rep.name}
                </h3>

                <div className="flex items-center justify-between text-xs text-[#8B91B0] pt-2 border-t border-[#1E2133]">
                  <span>Patient: <strong className="text-[#E8EAF6]">{rep.customerName}</strong></span>
                  <span>{rep.uploadedAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Document Viewer & Reviewer Panel */}
        {selectedReport && (
          <div className="lg:col-span-2 flex flex-col gap-4 animate-slide-up">
            {/* Document Viewer Frame */}
            <div className="fluetas-card p-5 bg-[#0B0D14] border-[#1E2133]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2133] mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/15 text-[#FBBF24] flex items-center justify-center shadow-md">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                      {selectedReport.name}
                    </h3>
                    <p className="text-xs text-[#8B91B0] m-0">
                      Patient: {selectedReport.customerName} · Uploaded {selectedReport.uploadedAt}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-[#38BDF8] font-bold font-mono">PDF · 2.4 MB (Encrypted)</span>
              </div>

              {/* Lab Values Preview */}
              <div className="p-4 bg-[#13161F] rounded-xl border border-[#1E2133] text-xs leading-relaxed text-[#E8EAF6]">
                <strong className="text-[#FBBF24] block mb-1 font-['Outfit']">Extracted Diagnostic Values:</strong>
                {selectedReport.summaryText}
              </div>
            </div>

            {/* Doctor Review Form (§18 & §19) */}
            <div className="fluetas-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="section-title">DOCTOR CLINICAL REVIEW &amp; FINDINGS</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold transition-all ${
                    reviewState === 'completed' || selectedReport.status === 'reviewed'
                      ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      : 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30'
                  }`}
                >
                  {reviewState === 'completed' || selectedReport.status === 'reviewed' ? '✓ Reviewed' : 'Pending Review'}
                </span>
              </div>

              <div className="text-xs flex flex-col gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">
                    Doctor Findings &amp; Observations *
                  </label>
                  <textarea
                    rows={3}
                    value={findings}
                    onChange={e => setFindings(e.target.value)}
                    placeholder="Enter diagnostic interpretation, reference range notes..."
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-3 text-[#E8EAF6] focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">
                    Actionable Clinical Directive / Supplement Recommendation
                  </label>
                  <textarea
                    rows={2}
                    value={recommendations}
                    onChange={e => setRecommendations(e.target.value)}
                    placeholder="Prescribe dosage modifications or therapies..."
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-xl p-3 text-[#E8EAF6] focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="fu-req"
                    checked={followUpRequired}
                    onChange={e => setFollowUpRequired(e.target.checked)}
                    className="accent-[#FBBF24]"
                  />
                  <label htmlFor="fu-req" className="text-xs text-[#E8EAF6] font-semibold cursor-pointer">
                    Clinical follow-up consultation required for this patient
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveReview}
                  disabled={reviewState === 'submitting' || !findings.trim()}
                  className={`btn-primary font-bold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                    reviewState === 'completed'
                      ? 'bg-[#10B981] text-black shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                      : 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                  }`}
                >
                  {reviewState === 'submitting' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Reviewing...</span>
                    </>
                  ) : reviewState === 'completed' ? (
                    <>
                      <Check size={14} />
                      <span>Reviewed ✓</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit &amp; Update Patient Timeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
