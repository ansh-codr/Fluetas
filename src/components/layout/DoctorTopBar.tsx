'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, X, ShieldCheck, ChevronRight, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const demoPatients = [
  { id: 'patient_demo_rahul', name: 'Rahul Mehta', email: 'rahul.mehta@example.com', age: 30, lastConsultation: '24 Aug 2026', status: 'Consent Active' },
  { id: 'patient_demo_priya', name: 'Priya Sharma', email: 'priya.sharma@example.com', age: 28, lastConsultation: '18 Aug 2026', status: 'Consent Active' },
  { id: 'patient_demo_arjun', name: 'Arjun Verma', email: 'arjun.verma@example.com', age: 34, lastConsultation: '10 Aug 2026', status: 'Consent Active' },
];

interface DoctorTopBarProps {
  onMenuToggle: () => void;
}

export default function DoctorTopBar({ onMenuToggle }: DoctorTopBarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = demoPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPatient = (patientId: string) => {
    setIsOpen(false);
    setSearchQuery('');
    router.push(`/doctor/patients/${patientId}`);
  };

  return (
    <header className="h-16 fixed top-0 left-0 md:left-[68px] lg:left-[220px] right-0 bg-[#0B0D14]/90 backdrop-blur-md border-b border-[#1E2133] flex items-center px-3 sm:px-6 gap-3 sm:gap-4 z-40 transition-all duration-300">
      {/* Mobile Hamburger */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg bg-[#13161F] border border-[#1E2133] text-[#8B91B0] hover:text-[#E8EAF6] md:hidden shrink-0 cursor-pointer"
        aria-label="Toggle menu"
      >
        <Menu size={18} />
      </button>

      {/* Title & Portal Badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-['Outfit'] text-sm sm:text-base font-bold text-[#E8EAF6] m-0 truncate">
            Doctor Workspace
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 hidden xs:inline">
            Clinical Practitioner
          </span>
        </div>
        <p className="text-[#8B91B0] text-[0.65rem] sm:text-xs m-0 truncate hidden sm:block">
          Manage authorized patient consultations, review diagnostic labs, and issue prescriptions.
        </p>
      </div>

      {/* Instant Patient Search with Smooth Dropdown (§16) */}
      <div ref={dropdownRef} className="relative hidden sm:block">
        <div className="flex items-center gap-2 bg-[#13161F] border border-[#1E2133] hover:border-[#38BDF8]/40 focus-within:border-[#38BDF8] rounded-xl px-3 py-1.5 min-w-[200px] lg:min-w-[260px] transition-colors">
          <Search size={14} className="text-[#8B91B0] shrink-0" />
          <input
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search authorized patients..."
            className="bg-transparent border-none outline-none text-[#E8EAF6] text-xs flex-1 min-w-0 placeholder-[#8B91B0]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
              }}
              className="text-[#8B91B0] hover:text-white cursor-pointer p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-[#13161F] border border-[#1E2133] rounded-2xl shadow-2xl p-2 z-50 animate-scale-in min-w-[280px]">
            <span className="text-[0.62rem] font-bold text-[#8B91B0] uppercase tracking-wider px-2 py-1 block">
              Matching Authorized Patients ({filtered.length})
            </span>

            {filtered.length === 0 ? (
              <p className="text-xs text-[#8B91B0] p-3 text-center m-0">
                No matching patients found with active consent.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#0B0D14] text-left transition-colors cursor-pointer w-full group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] font-bold flex items-center justify-center text-xs">
                        {patient.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#E8EAF6] m-0 leading-tight">
                          {patient.name}
                        </p>
                        <p className="text-[0.62rem] text-[#8B91B0] m-0">
                          Age {patient.age} · Last: {patient.lastConsultation}
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={13} className="text-[#8B91B0] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="flex items-center gap-2 bg-[#13161F] border border-[#1E2133] rounded-xl px-2.5 py-1.5 shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-xs font-bold text-black shrink-0">
            Dr
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[#E8EAF6] text-xs font-semibold m-0 leading-tight truncate max-w-[120px]">
              {user?.displayName || 'Clinical Expert'}
            </p>
            <p className="text-[#38BDF8] text-[0.6rem] font-bold m-0">
              Verified MD / Physio
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
