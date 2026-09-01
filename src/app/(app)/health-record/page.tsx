'use client';

import React, { useState } from 'react';
import {
  mockUser,
  mockHealthProfile,
  mockConsultationsList,
  mockDocumentsList,
} from '@/lib/mock/dashboardData';
import {
  FileText,
  Heart,
  Stethoscope,
  Pill,
  Download,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function HealthRecordPage() {
  const [activeSection, setActiveSection] = useState<'all' | 'consults' | 'reports' | 'meds' | 'history'>('all');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleExportPdf = () => {
    setDownloadingPdf(true);
    setTimeout(() => {
      setDownloadingPdf(false);
      alert('Medical Health Record summary generated and ready for secure download!');
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#151928] to-[#122320] border-[#10B981]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#10B981]/20 text-[#10B981]">
                <ShieldCheck size={18} />
              </span>
              <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
                MY PERMANENT HEALTH RECORD
              </h1>
            </div>
            <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
              Single unified clinical profile · Immutable chronological history · Patient-owned data
            </p>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={downloadingPdf}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Download size={15} />
            {downloadingPdf ? 'Compiling Medical PDF...' : 'Export Complete Record (PDF)'}
          </button>
        </div>
      </div>

      {/* Filter Navigation */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'Complete Hub View', icon: FileText },
          { id: 'consults', label: 'Consultations & Notes', icon: Stethoscope },
          { id: 'reports', label: 'Diagnostics & Scans', icon: FileText },
          { id: 'meds', label: 'Active Medications', icon: Pill },
          { id: 'history', label: 'Allergies & Surgeries', icon: Heart },
        ].map(filter => {
          const Icon = filter.icon;
          const isActive = activeSection === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveSection(filter.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                isActive
                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-[#13161F] text-[#8B91B0] border-[#1E2133] hover:text-[#E8EAF6]'
              }`}
            >
              <Icon size={14} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Vital Snapshot & Allergies Callout */}
      {(activeSection === 'all' || activeSection === 'history') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="fluetas-card p-4">
            <span className="text-[0.68rem] font-bold text-[#8B91B0] uppercase tracking-wider block mb-2">
              Patient Identification
            </span>
            <p className="text-base font-bold text-[#E8EAF6] m-0">{mockUser.name}</p>
            <p className="text-xs text-[#8B91B0] m-0 mt-0.5">DOB: {mockUser.dob} (Age 30) · {mockUser.gender}</p>
            <div className="mt-3 pt-2.5 border-t border-[#1E2133] flex justify-between text-xs">
              <span className="text-[#8B91B0]">Blood Group:</span>
              <strong className="text-[#10B981]">{mockUser.bloodGroup}</strong>
            </div>
          </div>

          <div className="fluetas-card p-4 border-[#F472B6]/30">
            <span className="text-[0.68rem] font-bold text-[#F472B6] uppercase tracking-wider block mb-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Documented Allergies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mockHealthProfile.allergies.map(a => (
                <span key={a} className="px-2 py-0.5 rounded bg-[#F472B6]/15 text-[#F472B6] text-[0.72rem] font-semibold border border-[#F472B6]/30">
                  {a}
                </span>
              ))}
            </div>
            <p className="text-[0.65rem] text-[#8B91B0] m-0 mt-3">
              Visible to all consulting doctors prior to prescribing.
            </p>
          </div>

          <div className="fluetas-card p-4">
            <span className="text-[0.68rem] font-bold text-[#38BDF8] uppercase tracking-wider block mb-2">
              Musculoskeletal Precedent
            </span>
            <div className="flex flex-col gap-1 text-xs">
              <p className="font-semibold text-[#E8EAF6] m-0">Meniscus Repair (2022)</p>
              <p className="text-[0.7rem] text-[#8B91B0] m-0">Grade 2 Ankle Sprain (2024)</p>
              <p className="text-[0.7rem] text-[#38BDF8] m-0 font-medium">L4-L5 Lumbar Strain (Active Physio)</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Consultations Record */}
      {(activeSection === 'all' || activeSection === 'consults') && (
        <div className="fluetas-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] uppercase tracking-wider m-0 flex items-center gap-2">
              <Stethoscope size={16} className="text-[#10B981]" />
              Consultations & Clinical Assessments
            </h2>
            <span className="text-xs text-[#8B91B0]">{mockConsultationsList.length} Total Sessions</span>
          </div>

          <div className="flex flex-col gap-3">
            {mockConsultationsList.map(cons => (
              <div
                key={cons.id}
                className="p-4 rounded-xl bg-[#0B0D14] border border-[#1E2133] flex flex-col gap-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#E8EAF6]">{cons.doctorName}</span>
                      <span className="text-xs text-[#8B91B0]">({cons.specialization})</span>
                    </div>
                    <p className="text-xs text-[#10B981] font-medium m-0 mt-0.5 flex items-center gap-1">
                      <Clock size={12} />
                      {cons.dateTime} · <span className="capitalize">{cons.status}</span>
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[0.68rem] font-bold self-start sm:self-auto ${
                    cons.status === 'Completed'
                      ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                  }`}>
                    {cons.status}
                  </span>
                </div>

                <p className="text-xs text-[#E8EAF6] m-0 bg-[#13161F] p-2.5 rounded-lg border border-[#1E2133]">
                  <strong>Reason:</strong> {cons.reasonForConsultation}
                </p>

                {cons.clinicalNotes && (
                  <div className="text-xs text-[#8B91B0] leading-relaxed bg-[#13161F] p-3 rounded-lg border border-[#1E2133] space-y-1.5">
                    <p className="m-0"><strong className="text-[#38BDF8]">Clinical Notes:</strong> {cons.clinicalNotes}</p>
                    <p className="m-0"><strong className="text-[#10B981]">Assessment:</strong> {cons.assessment}</p>
                    <p className="m-0"><strong className="text-[#FBBF24]">Recommendations:</strong> {cons.advice}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Diagnostic Reports */}
      {(activeSection === 'all' || activeSection === 'reports') && (
        <div className="fluetas-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] uppercase tracking-wider m-0 flex items-center gap-2">
              <FileText size={16} className="text-[#38BDF8]" />
              Lab Reports & Diagnostic Scans
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {mockDocumentsList.map(doc => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-[#0B0D14] border border-[#1E2133] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold uppercase bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                      {doc.documentType}
                    </span>
                    <span className="text-[0.68rem] text-[#8B91B0]">{doc.dateOfReport}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#E8EAF6] m-0">{doc.reportName}</h3>
                  <p className="text-[0.7rem] text-[#8B91B0] m-0 mt-0.5">{doc.uploadedBy} · {doc.fileSize}</p>
                </div>

                {doc.doctorReview && (
                  <div className="bg-[#13161F] p-2.5 rounded-lg border border-[#1E2133] text-[0.72rem] text-[#8B91B0]">
                    <span className="text-[#10B981] font-semibold block mb-0.5">
                      Reviewed by {doc.doctorReview.reviewedBy} ({doc.doctorReview.reviewedDate}):
                    </span>
                    <p className="m-0 text-[#E8EAF6]">{doc.doctorReview.findings}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Current Medications */}
      {(activeSection === 'all' || activeSection === 'meds') && (
        <div className="fluetas-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] uppercase tracking-wider m-0 flex items-center gap-2">
              <Pill size={16} className="text-[#A78BFA]" />
              Active Medication & Supplement Regimen
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mockHealthProfile.currentMedications.map((med, i) => (
              <div key={i} className="p-3.5 bg-[#0B0D14] border border-[#1E2133] rounded-xl">
                <p className="font-bold text-sm text-[#E8EAF6] m-0">{med.name}</p>
                <p className="text-xs text-[#A78BFA] font-medium m-0 mt-1">{med.dosage}</p>
                <p className="text-[0.68rem] text-[#8B91B0] m-0 mt-2">Prescribed: {med.prescribedBy}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
