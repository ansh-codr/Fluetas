'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  reviewMedicalReport,
  getAuthorizedPatientsForDoctor,
  getCustomerMedicalReports,
} from '@/lib/services/doctorService';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Send,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface ReportItem {
  id: string;
  customerId: string;
  customerName: string;
  documentType: string;
  name: string;
  uploadedAt: string;
  status: 'pending_review' | 'reviewed';
  summaryText?: string;
  downloadUrl?: string;
}

export default function DoctorReportsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [reviewState, setReviewState] = useState<'idle' | 'submitting' | 'completed'>('idle');

  const doctorId = user?.uid || '';
  const doctorName = user?.displayName || 'Clinical Practitioner';

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    // Load authorized patients and their uploaded documents
    getAuthorizedPatientsForDoctor(doctorId)
      .then(async relationships => {
        const collectedReports: ReportItem[] = [];
        for (const rel of relationships) {
          try {
            const patientReports = await getCustomerMedicalReports(rel.customerId);
            for (const doc of patientReports) {
              collectedReports.push({
                id: doc.id || doc.documentId,
                customerId: rel.customerId,
                customerName: rel.customerName,
                documentType: doc.documentType || 'Diagnostic Report',
                name: doc.name || 'Medical Document',
                uploadedAt: doc.uploadedAt?.seconds
                  ? new Date(doc.uploadedAt.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Recent',
                status: (doc.status as any) || 'pending_review',
                summaryText: doc.notes || 'Encrypted diagnostic document.',
                downloadUrl: doc.fileUrl,
              });
            }
          } catch {
            // skip if inaccessible
          }
        }
        setReports(collectedReports);
        if (collectedReports.length > 0) {
          setSelectedReport(collectedReports[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [doctorId]);

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

      setReviewState('completed');
      success('Clinical review and recommendations securely saved to patient timeline.');
      setTimeout(() => {
        setReviewState('idle');
        setSelectedReport(prev => prev ? { ...prev, status: 'reviewed' } : null);
        setReports(prev =>
          prev.map(r => (r.id === selectedReport.id ? { ...r, status: 'reviewed' } : r))
        );
      }, 2000);
    } catch {
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

      {loading ? (
        <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#FBBF24]" />
          Loading patient diagnostic documents...
        </div>
      ) : reports.length === 0 ? (
        <div className="fluetas-card p-12 text-center text-xs text-[#8B91B0]">
          No diagnostic reports awaiting review. When your authorized patients upload lab panels or clinical scans, they will appear here automatically.
        </div>
      ) : (
        /* Reports Split Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Report List */}
          <div className="flex flex-col gap-3">
            <span className="section-title">DIAGNOSTIC DOCUMENTS ({reports.length})</span>

            {reports.map(rep => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => {
                    setSelectedReport(rep);
                    setFindings('');
                    setRecommendations('');
                  }}
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
                  <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-[#13161F] text-[#8B91B0] border border-[#1E2133]">
                    Sovereign Encrypted Storage
                  </span>
                </div>

                {/* Simulated Viewer Area */}
                <div className="p-4 rounded-xl bg-[#13161F] border border-[#1E2133] text-xs space-y-3 font-mono">
                  <div className="flex items-center justify-between text-[#8B91B0] pb-2 border-b border-[#1E2133]">
                    <span>DOCUMENT SUMMARY EXTRACT</span>
                    <span className="text-[#10B981] flex items-center gap-1">
                      <ShieldCheck size={12} /> HIPAA / Consent Compliant
                    </span>
                  </div>
                  <p className="text-[#E8EAF6] leading-relaxed m-0 whitespace-pre-wrap">
                    {selectedReport.summaryText || 'Document content encrypted. Stored in client sovereignty partition.'}
                  </p>
                </div>
              </div>

              {/* Doctor Review Form */}
              <div className="fluetas-card p-5 border-[#FBBF24]/30">
                <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0 mb-3 flex items-center gap-2">
                  <Eye size={18} className="text-[#FBBF24]" />
                  Practitioner Diagnostic Review &amp; Recommendations
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#8B91B0] font-semibold mb-1">
                      Clinical Findings &amp; Observations
                    </label>
                    <textarea
                      rows={3}
                      value={findings}
                      onChange={e => setFindings(e.target.value)}
                      placeholder="Enter clinical observations regarding lab values, scan findings, or deviations from normal ranges..."
                      className="w-full p-3 rounded-xl bg-[#0E111A] border border-[#2A2F45] text-[#E8EAF6] outline-none focus:border-[#FBBF24] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8B91B0] font-semibold mb-1">
                      Actionable Recommendations / Prescription Advice
                    </label>
                    <textarea
                      rows={3}
                      value={recommendations}
                      onChange={e => setRecommendations(e.target.value)}
                      placeholder="Specify therapeutic adjustments, supplementation, or lifestyle interventions..."
                      className="w-full p-3 rounded-xl bg-[#0E111A] border border-[#2A2F45] text-[#E8EAF6] outline-none focus:border-[#FBBF24] leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-[#E8EAF6] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={followUpRequired}
                        onChange={e => setFollowUpRequired(e.target.checked)}
                        className="rounded accent-[#FBBF24] w-4 h-4 cursor-pointer"
                      />
                      <span>Flag for formal clinical follow-up</span>
                    </label>

                    <button
                      onClick={handleSaveReview}
                      disabled={reviewState === 'submitting' || !findings.trim()}
                      className="btn-primary bg-[#FBBF24] hover:bg-[#F59E0B] text-black text-xs font-bold px-5 py-2.5 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {reviewState === 'submitting' ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Saving Review...</span>
                        </>
                      ) : reviewState === 'completed' ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Review Saved!</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Submit Clinical Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
