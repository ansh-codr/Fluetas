'use client';

import React, { useState } from 'react';
import {
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
    color: '#2E7D32',
  },
  {
    id: 'scan-2',
    code: 'DOC-ANJALI-AUTH-77',
    title: 'Dr. Anjali Mehta Clinic Check-in Token',
    result: 'Consultation Room Access Granted · Encrypted Bridge Active',
    date: '22 Aug 2026',
    status: 'Verified',
    color: '#2E6DA4',
  },
  {
    id: 'scan-3',
    code: 'THYROCARE-LAB-8910',
    title: 'Lab Sample Telemetry Sync Barcode',
    result: 'Matched to Patient Record · 5 Biomarkers Extracted',
    date: '18 Jul 2026',
    status: 'Processed',
    color: '#7A4E9E',
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
        <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
          SCAN QR · PRODUCT AUTHENTICITY &amp; TOKENS
        </h1>
        <p className="text-[#586151] text-xs sm:text-sm m-0">
          Scan FLUETAS product seals, clinical check-in tokens, or diagnostic lab slips.
        </p>
      </div>

      {/* Viewfinder Camera Box */}
      <div className="fluetas-card p-6 flex flex-col items-center justify-center text-center bg-white border border-[rgba(18,22,15,0.10)] relative overflow-hidden">
        {/* Animated Scanner Box */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl border-2 border-[rgba(18,22,15,0.15)] bg-[#12160F] flex items-center justify-center overflow-hidden mb-4 shadow-inner">
          {/* Corner Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#2E7D32]" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#2E7D32]" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#2E7D32]" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#2E7D32]" />

          {/* Laser Line */}
          {isScanning && (
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2E7D32] to-transparent shadow-[0_0_12px_#2E7D32] animate-pulse" style={{ top: '50%' }} />
          )}

          <div className="flex flex-col items-center gap-2 text-center p-4">
            <Camera size={36} className="text-neutral-400 opacity-60" />
            <p className="text-xs text-neutral-300 m-0">
              Align QR Code or Batch Barcode within frame
            </p>
          </div>
        </div>

        {/* Scan Status / Trigger */}
        {scannedResult ? (
          <div className="bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-xl p-4 max-w-md w-full animate-fade-in flex flex-col items-center gap-2 text-center">
            <CheckCircle2 size={24} className="text-[#2E7D32]" />
            <p className="font-bold text-sm text-[#12160F] m-0">{scannedResult}</p>
            <button
              onClick={() => {
                setScannedResult(null);
                setIsScanning(true);
              }}
              className="mt-2 text-xs text-[#2E7D32] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCw size={13} /> Scan Another Code
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={simulateScan}
              className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles size={14} />
              Simulate Camera Scan (Test)
            </button>
            <span className="text-[0.68rem] text-[#8A9482] flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#2E7D32]" />
              Secure 256-bit cryptographic verification pipeline
            </span>
          </div>
        )}
      </div>

      {/* Recent Scans Stream */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#2E7D32]" />
          <span className="section-title">RECENT VERIFICATION SCANS</span>
        </div>

        <div className="flex flex-col gap-3">
          {mockRecentScans.map(scan => (
            <div
              key={scan.id}
              className="fluetas-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-mono font-bold"
                  style={{ backgroundColor: `${scan.color}15`, color: scan.color }}
                >
                  QR
                </div>
                <div>
                  <h3 className="font-['Outfit'] text-sm font-bold text-[#12160F] m-0">
                    {scan.title}
                  </h3>
                  <p className="text-xs text-[#586151] m-0 mt-0.5">
                    {scan.result}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                <span className="text-[0.68rem] text-[#8A9482]">{scan.date}</span>
                <span
                  className="px-2 py-0.5 rounded text-[0.65rem] font-bold"
                  style={{ backgroundColor: `${scan.color}15`, color: scan.color }}
                >
                  {scan.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
