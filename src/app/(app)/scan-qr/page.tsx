'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';

export default function ScanQRPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto w-full text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-[#F2F4EE] border border-[rgba(18,22,15,0.12)] flex items-center justify-center text-[#586151] mb-4 shadow-sm">
        <QrCode size={32} />
      </div>

      <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
        QR &amp; Product Verification
      </h1>

      <p className="text-[#586151] text-xs sm:text-sm mt-2 mb-6 max-w-md leading-relaxed">
        Physical batch verification and clinical token scanning are currently inactive in the FLUETAS MVP. Core features including telehealth consultations, telemetry tracking, and personalized training are active.
      </p>

      <Link
        href="/dashboard"
        className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold no-underline shadow-sm"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>
    </div>
  );
}
