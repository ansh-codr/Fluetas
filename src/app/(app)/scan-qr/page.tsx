'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Camera,
  History,
  RotateCw,
} from 'lucide-react';

const mockRecentScans = [
  {
    id: 'scan-1',
    code: 'FLU-REC-2026-B884',
    title: 'FLUETAS RECOVER+ Batch #884 Verification',
    result: 'Authentic 100% Superfruit Formula · Bottled July 2026',
    date: 'Yesterday, 04:30 PM',
    status: 'Verified',
    color: '#10B981',
  },
  {
    id: 'scan-2',
    code: 'DOC-ANJALI-AUTH-77',
    title: 'Dr. Anjali Mehta Clinic Check-in Token',
    result: 'Consultation Room Access Granted · Encrypted Bridge Active',
    date: '22 Aug 2026',
    status: 'Verified',
    color: '#38BDF8',
  },
  {
    id: 'scan-3',
    code: 'THYROCARE-LAB-8910',
    title: 'Lab Sample Telemetry Sync Barcode',
    result: 'Matched to Patient Yogesh Sharma · 5 Biomarkers Extracted',
    date: '18 Jul 2026',
    status: 'Processed',
    color: '#A78BFA',
  },
];

export default function ScanQRPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const simulateScan = () => {
    setIsScanning(false);
    setScannedResult('FLUETAS GUT+ Batch #912 · Authentic 10-Strain Synbiotic Verified');
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
          SCAN QR · PRODUCT AUTHENTICITY & TOKENS
        </h1>
        <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
          Scan FLUETAS product seals, clinical check-in tokens, or diagnostic lab slips.
        </p>
      </div>

      {/* Viewfinder Camera Box */}
      <div className="fluetas-card p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#13161F] to-[#0A0D16] border-[#1E2133] relative overflow-hidden">
        {/* Animated Scanner Box */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl border-2 border-[#1E2133] bg-[#07090F] flex items-center justify-center overflow-hidden mb-4 shadow-inner">
          {/* Corner Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#10B981]" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#10B981]" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#10B981]" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#10B981]" />

          {/* Laser Line */}
          {isScanning && (
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent shadow-[0_0_12px_#10B981] animate-pulse-dot" style={{ top: '50%' }} />
          )}

          <div className="flex flex-col items-center gap-2 text-center p-4">
            <Camera size={36} className="text-[#8B91B0] opacity-50" />
            <p className="text-xs text-[#8B91B0] m-0">
              Align QR Code or Batch Barcode within frame
            </p>
          </div>
        </div>

        {/* Scan Status / Trigger */}
        {scannedResult ? (
          <div className="bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl p-4 max-w-md w-full animate-fade-in flex flex-col items-center gap-2 text-center">
            <CheckCircle2 size={24} className="text-[#10B981]" />
            <p className="font-bold text-sm text-[#E8EAF6] m-0">{scannedResult}</p>
            <button
              onClick={() => {
                setScannedResult(null);
                setIsScanning(true);
              }}
              className="mt-2 text-xs text-[#10B981] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCw size={13} /> Scan Another Code
            </button>
          </div>
        ) : (
          <button
            onClick={simulateScan}
            className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_14px_rgba(16,185,129,0.3)]"
          >
            <QrCode size={15} />
            Simulate Instant QR Scan
          </button>
        )}
      </div>

      {/* Recent Scans History */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#38BDF8]" />
          <span className="section-title">RECENT SCANS & VERIFICATION LOG</span>
        </div>

        {mockRecentScans.map(scan => (
          <div
            key={scan.id}
            className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#2A3050] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                style={{ backgroundColor: `${scan.color}15`, borderColor: `${scan.color}35`, color: scan.color }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-['Outfit'] text-sm font-bold text-[#E8EAF6] m-0">
                    {scan.title}
                  </h3>
                  <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
                    {scan.status}
                  </span>
                </div>
                <p className="text-xs text-[#8B91B0] m-0 mt-0.5">
                  {scan.result} · {scan.date}
                </p>
              </div>
            </div>

            <span className="text-[0.68rem] font-mono text-[#8B91B0] bg-[#0B0D14] px-2.5 py-1 rounded-md border border-[#1E2133] self-start sm:self-auto shrink-0">
              {scan.code}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
