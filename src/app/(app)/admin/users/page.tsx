'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getAdminUsersList,
  updateUserAccountStatus,
  AdminUserRecord,
} from '@/lib/services/adminService';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Loader2,
  Lock,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const adminId = user?.uid || 'admin_root';

  const loadUsers = async () => {
    try {
      const res = await getAdminUsersList();
      if (res.length === 0) {
        setUsers([
          { id: 'usr_demo_1', name: 'Rahul Mehta', email: 'rahul.mehta@example.com', role: 'customer', status: 'active', onboardingComplete: true },
          { id: 'usr_demo_2', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'customer', status: 'active', onboardingComplete: true },
          { id: 'usr_demo_3', name: 'Dr. Rajesh Sharma', email: 'dr.sharma@fluetas.com', role: 'doctor', status: 'active', onboardingComplete: true },
          { id: 'usr_demo_4', name: 'System Admin', email: 'admin@fluetas.com', role: 'admin', status: 'active', onboardingComplete: true },
        ]);
      } else {
        setUsers(res);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (userRecord: AdminUserRecord) => {
    const nextStatus = userRecord.status === 'suspended' ? 'active' : 'suspended';
    setProcessingId(userRecord.id);
    try {
      await updateUserAccountStatus({
        userId: userRecord.id,
        userName: userRecord.name,
        status: nextStatus,
        adminId,
        reason: `Admin toggle status to ${nextStatus}`,
      });
      setToastMessage(`Account status updated to ${nextStatus.toUpperCase()} for ${userRecord.name}`);
      setTimeout(() => setToastMessage(null), 3500);
      await loadUsers();
    } catch (err) {
      alert('Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#10B981] text-black font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} className="text-[#10B981]" />
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#E8EAF6] m-0">
              USER ACCOUNT MANAGEMENT
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Account governance, status enforcement, and role visibility across platform members.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="fluetas-card p-4 flex items-center gap-3">
        <Search size={16} className="text-[#8B91B0] shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name, email, or role..."
          className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#E8EAF6] w-full"
        />
      </div>

      {/* Users Table */}
      <div className="fluetas-card p-5 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2133] text-[#8B91B0] uppercase text-[0.65rem] tracking-wider">
              <th className="pb-3 font-semibold">User</th>
              <th className="pb-3 font-semibold">Email</th>
              <th className="pb-3 font-semibold">Role</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2133]">
            {filtered.map(usr => {
              const isSuspended = usr.status === 'suspended';
              const isProcessing = processingId === usr.id;
              return (
                <tr key={usr.id} className="hover:bg-[#13161F]/50 transition-colors">
                  <td className="py-3.5 pr-3 font-bold text-[#E8EAF6] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1E2133] flex items-center justify-center font-bold text-xs text-[#10B981]">
                      {usr.name[0]}
                    </div>
                    <span>{usr.name}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-[#8B91B0]">{usr.email}</td>
                  <td className="py-3.5 pr-3">
                    <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase bg-[#1E2133] text-[#E8EAF6]">
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold ${
                        isSuspended
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      }`}
                    >
                      {usr.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleToggleStatus(usr)}
                      disabled={isProcessing}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        isSuspended
                          ? 'bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 border border-[#10B981]/30'
                          : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                      }`}
                    >
                      {isProcessing ? 'Updating...' : isSuspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
