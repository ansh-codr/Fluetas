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
  AlertCircle,
  Shield,
  Loader2,
  UserPlus,
  Trash2,
  Lock,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Admin Management State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const loadUsers = async () => {
    try {
      const res = await getAdminUsersList();
      setUsers(res || []);
    } catch (err) {
      console.warn('[AdminUsers] Load error:', err);
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
        adminId: user?.uid || 'admin_root',
      });
      setUsers(prev =>
        prev.map(u => (u.id === userRecord.id ? { ...u, status: nextStatus } : u))
      );
      setToastMessage(`Account status updated to ${nextStatus}`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      alert('Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setAdminError('');
    setAdminSuccess('');
    setAddingAdmin(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'ADD_ADMIN_BY_EMAIL',
          email: newAdminEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to add administrator');
      }

      setAdminSuccess(`Successfully granted platform administrator access to ${newAdminEmail.trim()}`);
      setNewAdminEmail('');
      await loadUsers();
    } catch (err: any) {
      setAdminError(err.message || 'Operation failed');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (adminRecord: AdminUserRecord) => {
    if (!confirm(`Revoke administrator access from ${adminRecord.email}?`)) return;

    setProcessingId(adminRecord.id);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'REMOVE_ADMIN',
          targetUid: adminRecord.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to revoke administrator');
      }

      setToastMessage(`Admin access revoked for ${adminRecord.email}`);
      setTimeout(() => setToastMessage(null), 3500);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke administrator');
    } finally {
      setProcessingId(null);
    }
  };

  const adminsList = users.filter(u => u.role === 'admin');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
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
              USER &amp; ADMINISTRATOR GOVERNANCE
            </h1>
          </div>
          <p className="text-[#8B91B0] text-xs sm:text-sm m-0">
            Authoritative RBAC management, administrator invitations, and account status governance.
          </p>
        </div>
      </div>

      {/* ── CARD 1: Administrator Management Section ────────────────────── */}
      <div className="fluetas-card p-5 sm:p-6 bg-[#13161F] border border-amber-500/30">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1E2133]">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-400" />
            <h2 className="font-['Outfit'] text-base font-bold text-white m-0">
              Platform Administrators ({adminsList.length})
            </h2>
          </div>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Immutable Audit Logging Active
          </span>
        </div>

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="mb-5">
          <label className="block text-xs font-semibold text-[#8B91B0] mb-2">
            Grant Administrator Privileges by Registered Email
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              required
              placeholder="existing-user@example.com"
              value={newAdminEmail}
              onChange={e => setNewAdminEmail(e.target.value)}
              className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-[#0E111A] border border-[#2A2F45] text-white text-xs sm:text-sm focus:border-amber-500 outline-none"
            />
            <button
              type="submit"
              disabled={addingAdmin || !newAdminEmail.trim()}
              className="min-h-[42px] px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {addingAdmin ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Promote to Admin</span>
                </>
              )}
            </button>
          </div>
          {adminError && (
            <div className="mt-2 text-xs text-red-400 flex items-center gap-1.5 animate-slide-up">
              <AlertCircle size={14} />
              <span>{adminError}</span>
            </div>
          )}
          {adminSuccess && (
            <div className="mt-2 text-xs text-[#10B981] flex items-center gap-1.5 animate-slide-up">
              <CheckCircle2 size={14} />
              <span>{adminSuccess}</span>
            </div>
          )}
        </form>

        {/* Existing Admins Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2133] text-[#8B91B0] uppercase text-[0.65rem] tracking-wider">
                <th className="pb-2.5 font-semibold">Admin</th>
                <th className="pb-2.5 font-semibold">Email</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2133]">
              {adminsList.map(adm => (
                <tr key={adm.id} className="hover:bg-[#1A1E2E]/50 transition-colors">
                  <td className="py-3 pr-3 font-bold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                      {adm.name ? adm.name[0] : 'A'}
                    </div>
                    <span>{adm.name || 'Platform Administrator'}</span>
                    {adm.id === user?.uid && (
                      <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        You
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-[#8B91B0] font-mono text-xs">{adm.email}</td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      {adm.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {adm.id !== user?.uid && (
                      <button
                        onClick={() => handleRemoveAdmin(adm)}
                        disabled={processingId === adm.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 cursor-pointer transition-colors"
                      >
                        Revoke Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CARD 2: All Platform Users Table ───────────────────────────── */}
      <div className="fluetas-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-['Outfit'] text-base font-bold text-[#E8EAF6] m-0">
            All Registered Platform Accounts ({users.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B91B0]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#0E111A] border border-[#2A2F45] text-xs text-[#E8EAF6] outline-none focus:border-[#10B981]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
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
                        {usr.name ? usr.name[0] : 'U'}
                      </div>
                      <span>{usr.name || 'User'}</span>
                    </td>
                    <td className="py-3.5 pr-3 text-[#8B91B0]">{usr.email}</td>
                    <td className="py-3.5 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                        usr.role === 'admin'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : usr.role === 'expert' || usr.role === 'doctor'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-[#1E2133] text-[#E8EAF6]'
                      }`}>
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
    </div>
  );
}
