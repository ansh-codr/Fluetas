'use client';

import React, { useState } from 'react';
import { mockDocumentsList } from '@/lib/mock/dashboardData';
import {
  FileText,
  Upload,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface DocumentItem {
  id: string;
  documentType: 'report' | 'scan' | 'prescription' | 'other' | string;
  reportName: string;
  dateOfReport: string;
  uploadedBy: string;
  fileSize: string;
  status: string;
  statusStep: number;
  relatedConsultationId?: string;
  doctorReview?: {
    reviewedBy: string;
    reviewedDate: string;
    findings: string;
    recommendation: string;
    followupRequired: boolean;
    notes: string;
  };
  testParameters?: {
    test: string;
    value: string;
    refRange: string;
    status: string;
    color: string;
  }[];
}

const pipelineSteps = ['Requested', 'Uploaded', 'Reviewed', 'Commented', 'Completed'];

export default function ReportsPage() {
  const [filter, setFilter] = useState<'all' | 'report' | 'scan' | 'prescription'>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocumentsList);

  // Form State
  const [reportName, setReportName] = useState('');
  const [docType, setDocType] = useState('report');
  const [facility, setFacility] = useState('Thyrocare Labs');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setDocuments([
      {
        id: `doc-${Date.now()}`,
        documentType: docType as any,
        reportName: reportName || 'Diagnostic Lab Panel',
        dateOfReport: 'Today',
        uploadedBy: facility || 'Patient Upload',
        fileSize: '3.1 MB',
        status: 'Uploaded',
        statusStep: 2,
        relatedConsultationId: 'cons-01',
      },
      ...documents,
    ]);
    setUploadModalOpen(false);
    setReportName('');
  };

  const filteredDocs = filter === 'all'
    ? documents
    : documents.filter(d => d.documentType === filter);

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
            MEDICAL REPORTS & DIAGNOSTICS
          </h1>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            End-to-end clinical pipeline: from test request to expert review and telemetry extraction.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Upload size={15} />
          Upload New Document
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Documents (3)' },
          { id: 'report', label: 'Blood & Metabolic Reports (1)' },
          { id: 'scan', label: 'Diagnostic MRI & Scans (1)' },
          { id: 'prescription', label: 'Prescriptions & Protocols (1)' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
              filter === f.id
                ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                : 'bg-[#13161F] text-[#8B91B0] border-[#1E2133] hover:text-[#E8EAF6]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Documents Stream */}
      <div className="flex flex-col gap-4">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="fluetas-card p-5 flex flex-col gap-4 hover:border-[#2A3050] transition-colors"
          >
            {/* Header & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] text-xl shrink-0">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
                      {doc.reportName}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold uppercase bg-[#1E2133] text-[#8B91B0]">
                      {doc.documentType}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                    {doc.uploadedBy} · {doc.dateOfReport} · {doc.fileSize}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => alert(`Opening ${doc.reportName} securely`)}
                  className="px-3 py-1.5 rounded-lg bg-[#13161F] border border-[#1E2133] text-[#8B91B0] hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={13} /> View
                </button>
                <button
                  onClick={() => alert(`Downloading verified copy of ${doc.reportName}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} /> Download
                </button>
              </div>
            </div>

            {/* Pipeline Stage Tracker */}
            <div className="bg-[#0B0D14] p-3.5 rounded-xl border border-[#1E2133]">
              <span className="text-[0.65rem] font-bold text-[#8B91B0] uppercase tracking-wider block mb-2.5">
                Clinical Workflow Status: <strong className="text-[#10B981]">{doc.status}</strong>
              </span>

              <div className="grid grid-cols-5 gap-1 text-center">
                {pipelineSteps.map((step, idx) => {
                  const isCompleted = (doc.statusStep || 1) >= idx + 1;
                  return (
                    <div key={step} className="flex flex-col items-center gap-1">
                      <div className={`h-1.5 w-full rounded-full ${
                        isCompleted ? 'bg-[#10B981]' : 'bg-[#1E2133]'
                      }`} />
                      <span className={`text-[0.62rem] font-semibold truncate w-full ${
                        isCompleted ? 'text-[#10B981]' : 'text-[#8B91B0]'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Parameters Table preview (if structured report) */}
            {doc.testParameters && (
              <div className="bg-[#13161F] rounded-xl border border-[#1E2133] overflow-hidden text-xs">
                <div className="p-2.5 bg-[#0B0D14] border-b border-[#1E2133] flex items-center justify-between">
                  <span className="font-bold text-[#E8EAF6] flex items-center gap-1.5">
                    <FileSpreadsheet size={14} className="text-[#10B981]" />
                    Extracted Diagnostic Telemetry
                  </span>
                  <span className="text-[0.68rem] text-[#8B91B0]">Verified by AI Parser</span>
                </div>

                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {doc.testParameters.map((param, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#0B0D14] border border-[#1E2133] flex flex-col justify-between">
                      <span className="text-[0.68rem] text-[#8B91B0] truncate">{param.test}</span>
                      <div className="flex items-center justify-between mt-1">
                        <strong className="text-[#E8EAF6] text-sm">{param.value}</strong>
                        <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${param.color}20`, color: param.color }}>
                          {param.status}
                        </span>
                      </div>
                      <span className="text-[0.62rem] text-[#8B91B0] mt-1">Ref: {param.refRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Review Findings */}
            {doc.doctorReview && (
              <div className="bg-[#10B981]/10 border border-[#10B981]/25 p-3 rounded-xl text-xs text-[#E8EAF6] flex flex-col gap-1">
                <span className="font-bold text-[#10B981] flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  Clinical Findings by {doc.doctorReview.reviewedBy} ({doc.doctorReview.reviewedDate})
                </span>
                <p className="m-0 text-[#8B91B0]">{doc.doctorReview.findings}</p>
                <p className="m-0 font-semibold text-[#10B981] mt-0.5">Protocol: {doc.doctorReview.recommendation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13161F] border border-[#1E2133] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B91B0] hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#E8EAF6] mb-4 font-['Outfit'] flex items-center gap-2">
              <Upload size={18} className="text-[#10B981]" />
              Upload Medical Document
            </h3>

            <form onSubmit={handleUpload} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block text-[#8B91B0] font-semibold mb-1">Document Title</label>
                <input
                  required
                  placeholder="e.g. Thyroid & Lipid Profile"
                  value={reportName}
                  onChange={e => setReportName(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Type</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                  >
                    <option value="report">Lab Blood Panel</option>
                    <option value="scan">MRI / X-Ray / Scan</option>
                    <option value="prescription">Prescription Rx</option>
                    <option value="other">Clinical Summary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8B91B0] font-semibold mb-1">Diagnostic Center</label>
                  <input
                    value={facility}
                    onChange={e => setFacility(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#1E2133] rounded-lg p-2.5 text-[#E8EAF6]"
                  />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-[#1E2133] hover:border-[#10B981] p-6 rounded-xl text-center bg-[#0B0D14] cursor-pointer transition-colors">
                <Upload size={24} className="text-[#10B981] mx-auto mb-2" />
                <p className="font-bold text-[#E8EAF6] m-0">Click to upload or drag PDF/DICOM file</p>
                <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-1">Encrypted on Firebase Storage · Up to 50MB</p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 justify-center font-bold"
              >
                Submit & Initiate Extraction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
