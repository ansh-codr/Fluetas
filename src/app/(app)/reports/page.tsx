'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getCustomerMedicalReports,
  uploadMedicalReport,
  MedicalReportDoc,
} from '@/lib/services/doctorService';
import {
  FileText,
  Upload,
  CheckCircle2,
  Eye,
  Download,
  X,
  Plus,
  Loader2,
  Calendar,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/motion/MotionUtils';

const pipelineSteps = ['Uploaded', 'Under Review', 'Reviewed'];

export default function ReportsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<MedicalReportDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MedicalReportDoc | null>(null);

  // Upload Form State
  const [reportName, setReportName] = useState('');
  const [docType, setDocType] = useState<'Lab Test' | 'Prescription' | 'MRI/X-Ray' | 'Discharge Summary' | 'Other'>('Lab Test');
  const [notes, setNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [formError, setFormError] = useState('');

  const loadReports = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await getCustomerMedicalReports(user.uid);
      setDocuments(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!reportName.trim()) {
      setFormError('Please enter a descriptive report or test name.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await uploadMedicalReport({
        userId: user.uid,
        userName: user.displayName || 'Patient',
        documentType: docType,
        name: reportName.trim(),
        notes: notes.trim(),
        fileUrl: selectedFileName ? `https://storage.fluetas.health/documents/${selectedFileName}` : undefined,
      });

      setUploadModalOpen(false);
      setReportName('');
      setNotes('');
      setSelectedFileName('');
      await loadReports();
    } catch (err: any) {
      setFormError(err.message || 'Failed to upload report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDocs = filter === 'all'
    ? documents
    : documents.filter(d => d.documentType.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={20} className="text-[#2E7D32]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              MEDICAL REPORTS &amp; DIAGNOSTICS
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Encrypted diagnostic storage: upload lab bloodwork, MRI scans, and prescriptions for verified clinical review.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadModalOpen(true);
            setFormError('');
          }}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Upload size={14} />
          Upload Document
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['all', 'Lab Test', 'Prescription', 'MRI/X-Ray', 'Discharge Summary'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              filter === f
                ? 'bg-[#2E7D32] text-white font-bold shadow-xs'
                : 'bg-[#FAFAF6] text-[#586151] border border-[rgba(18,22,15,0.08)] hover:text-[#12160F]'
            }`}
          >
            {f === 'all' ? 'All Documents' : f}
          </button>
        ))}
      </div>

      {/* Document List / Empty State */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="fluetas-card p-10 flex flex-col items-center justify-center text-center bg-white border border-[rgba(18,22,15,0.10)] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-3">
            <FileText size={28} />
          </div>
          <h3 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
            No medical documents found
          </h3>
          <p className="text-xs text-[#586151] max-w-sm mt-1.5 mb-5 leading-relaxed">
            {filter !== 'all'
              ? `No documents matching category "${filter}".`
              : 'Upload your lab blood panels, clinical prescriptions, or scan reports to share securely with your doctors.'}
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <Plus size={14} /> Upload First Document
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filteredDocs.map(doc => {
            const isReviewed = doc.status === 'reviewed';
            const uploadDateStr = doc.uploadedAt?.seconds
              ? new Date(doc.uploadedAt.seconds * 1000).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recently';

            return (
              <div
                key={doc.id || doc.documentId}
                className="fluetas-card p-4 sm:p-5 bg-white border border-[rgba(18,22,15,0.08)] hover:border-[rgba(18,22,15,0.18)] transition-all rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0">
                          {doc.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${
                            isReviewed
                              ? 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20'
                              : 'bg-[#2E6DA4]/10 text-[#2E6DA4] border-[#2E6DA4]/20'
                          }`}
                        >
                          {isReviewed ? 'CLINICALLY REVIEWED' : 'UPLOADED · PENDING REVIEW'}
                        </span>
                      </div>
                      <p className="text-[0.6875rem] text-[#586151] m-0 mt-0.5">
                        {doc.documentType} · Uploaded on {uploadDateStr}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] text-[#12160F] text-xs font-bold hover:bg-[#F2F4EE] transition-colors self-end sm:self-auto cursor-pointer"
                  >
                    {selectedDoc?.id === doc.id ? 'Close Details' : 'View Details'}
                  </button>
                </div>

                {/* Doctor Review Callout */}
                {isReviewed && doc.doctorReview && (
                  <div className="p-3 bg-[#2E7D32]/5 border border-[#2E7D32]/20 rounded-xl text-xs space-y-1 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2E7D32] flex items-center gap-1">
                        <ShieldCheck size={13} /> Reviewed by {doc.doctorReview.reviewerDoctorName}
                      </span>
                      <span className="text-[0.65rem] text-[#586151]">
                        {doc.doctorReview.followUpRequired ? 'Follow-up Recommended' : 'Routine'}
                      </span>
                    </div>
                    <p className="text-xs text-[#12160F] m-0 leading-relaxed font-medium">
                      <strong>Clinical Findings:</strong> {doc.doctorReview.findings}
                    </p>
                    {doc.doctorReview.recommendations && (
                      <p className="text-xs text-[#586151] m-0 leading-relaxed">
                        <strong>Advice:</strong> {doc.doctorReview.recommendations}
                      </p>
                    )}
                  </div>
                )}

                {/* Expanded Details */}
                {selectedDoc?.id === doc.id && doc.notes && (
                  <div className="mt-3 pt-3 border-t border-[rgba(18,22,15,0.06)] text-xs text-[#586151]">
                    <strong>Patient Upload Notes:</strong> {doc.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[rgba(18,22,15,0.15)] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-[rgba(18,22,15,0.08)] bg-[#FAFAF6]">
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-[#2E7D32]" />
                <h3 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#12160F] m-0">
                  Upload Medical Document
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-[#8A9482] hover:text-[#12160F] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-1">
                  Document / Test Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Bloodwork &amp; Lipid Panel"
                  value={reportName}
                  onChange={e => setReportName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-1">Category</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                >
                  <option value="Lab Test">Lab Test (Blood / Urine / Pathology)</option>
                  <option value="Prescription">Clinical Prescription</option>
                  <option value="MRI/X-Ray">Radiology (MRI / CT / X-Ray)</option>
                  <option value="Discharge Summary">Hospital Discharge Summary</option>
                  <option value="Other">Other Clinical Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-1">Select File (PDF / Image)</label>
                <div className="border border-dashed border-[rgba(18,22,15,0.20)] rounded-xl p-3 text-center bg-[#FAFAF6]">
                  <input
                    type="file"
                    id="medical-file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => setSelectedFileName(e.target.files?.[0]?.name || '')}
                    className="hidden"
                  />
                  <label
                    htmlFor="medical-file"
                    className="text-xs font-bold text-[#2E7D32] hover:underline cursor-pointer block"
                  >
                    {selectedFileName ? `Selected: ${selectedFileName}` : 'Choose PDF or image file'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12160F] mb-1">Clinical Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fasting sample drawn at Max Healthcare; physician wanted thyroid panel re-tested."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(18,22,15,0.15)] text-xs text-[#12160F] focus:outline-[#2E7D32]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#586151] hover:text-[#12160F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Save Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
