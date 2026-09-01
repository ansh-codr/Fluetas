'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, User, Stethoscope, ChevronRight, Check } from 'lucide-react';

export default function DevRoleSwitcher() {
  const { user, role, setDevRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const roles: { role: UserRole; label: string; icon: any; color: string; defaultRoute: string }[] = [
    { role: 'customer', label: 'Customer / User', icon: User, color: '#10B981', defaultRoute: '/dashboard' },
    { role: 'doctor', label: 'Doctor / Expert', icon: Stethoscope, color: '#38BDF8', defaultRoute: '/doctor/dashboard' },
    { role: 'admin', label: 'System Admin', icon: Shield, color: '#F59E0B', defaultRoute: '/admin/dashboard' },
  ];

  const handleSelectRole = async (targetRole: UserRole, targetRoute: string) => {
    await setDevRole(targetRole);
    setOpen(false);
    router.push(targetRoute);
  };

  const currentRoleObj = roles.find(r => r.role === role) || roles[0];
  const CurrentIcon = currentRoleObj.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 p-3 bg-[#13161F] border border-[#1E2133] rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[240px] animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2133]">
            <span className="text-[0.65rem] font-bold text-[#8B91B0] uppercase tracking-wider">
              Dev Persona Switcher
            </span>
            <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[#1E2133] text-[#10B981] font-mono font-bold">
              Shared DB
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {roles.map(r => {
              const Icon = r.icon;
              const isCurrent = role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => handleSelectRole(r.role, r.defaultRoute)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0B0D14] text-white border border-[#2A3050]'
                      : 'text-[#8B91B0] hover:bg-[#0B0D14] hover:text-[#E8EAF6]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${r.color}20`, color: r.color }}
                    >
                      <Icon size={13} />
                    </div>
                    <span>{r.label}</span>
                  </div>

                  {isCurrent && <Check size={14} className="text-[#10B981]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#13161F]/90 backdrop-blur-md border border-[#1E2133] hover:border-[#2A3050] text-xs font-bold text-[#E8EAF6] shadow-xl hover:scale-105 transition-all cursor-pointer"
        title="Switch Panel Persona"
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${currentRoleObj.color}25`, color: currentRoleObj.color }}
        >
          <CurrentIcon size={12} />
        </div>
        <span className="text-[0.72rem] hidden sm:inline">{currentRoleObj.label}</span>
        <span className="text-[0.6rem] text-[#8B91B0]">Role</span>
      </button>
    </div>
  );
}
