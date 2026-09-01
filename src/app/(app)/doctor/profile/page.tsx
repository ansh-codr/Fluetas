'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Stethoscope,
  ShieldCheck,
  Award,
  Clock,
  FileCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function DoctorProfilePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="fluetas-card p-5 sm:p-6 bg-gradient-to-r from-[#13161F] via-[#0E2433] to-[#0A1A24] border-[#38BDF8]/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-black font-extrabold flex items-center justify-center text-2xl shadow-lg shrink-0">
              Dr
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-['Outfit'] text-lg sm:text-2xl font-black text-[#E8EAF6] m-0">
                  {user?.displayName || 'Dr. Rajesh Sharma, MD'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Verified Medical Practitioner
                </span>
              </div>
              <p className="text-xs text-[#38BDF8] font-semibold m-0 mt-0.5">
                Senior Sports Medicine &amp; Orthopedic Rehabilitation Specialist
              </p>
              <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                License Reg: <strong className="text-[#E8EAF6]">MCI-2014-88492</strong> · 12+ Years Clinical Experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Credentials Card */}
      <div className="fluetas-card p-5 flex flex-col gap-4">
        <span className="section-title">CREDENTIALS &amp; VERIFICATION RECORD</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
            <span className="text-[0.65rem] text-[#8B91B0] block mb-1">Primary Qualification</span>
            <p className="font-bold text-[#E8EAF6] m-0">MBBS, MS (Orthopedics), Fellowship Sports Rehab</p>
          </div>

          <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
            <span className="text-[0.65rem] text-[#8B91B0] block mb-1">Hospital Affiliation</span>
            <p className="font-bold text-[#E8EAF6] m-0">Fortis Institute of Orthopedics &amp; Sports Medicine</p>
          </div>

          <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
            <span className="text-[0.65rem] text-[#8B91B0] block mb-1">Telehealth Consultation Fee</span>
            <p className="font-bold text-[#10B981] m-0">₹1,500 / 30-min Clinical Video Session</p>
          </div>

          <div className="p-3 bg-[#0B0D14] rounded-xl border border-[#1E2133]">
            <span className="text-[0.65rem] text-[#8B91B0] block mb-1">Security &amp; Encryption Standard</span>
            <p className="font-bold text-[#38BDF8] m-0">HIPAA &amp; ABDM Compliant Encrypted Telehealth</p>
          </div>
        </div>

        {/* Verification Documents */}
        <div className="pt-3 border-t border-[#1E2133]">
          <span className="text-xs font-bold text-[#E8EAF6] block mb-2">Verified Documents on File:</span>
          <div className="flex flex-wrap gap-2">
            {[
              'Medical_Council_Registration_Certificate.pdf',
              'Postgraduate_Degree_MS_Orthopedics.pdf',
              'Govt_Identity_Proof.pdf',
            ].map(doc => (
              <span key={doc} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold">
                <FileCheck size={13} /> {doc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
