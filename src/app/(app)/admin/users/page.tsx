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
        <div className="fixed top-20 right-6 z-50 bg-[#2E7D32] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
            <h1 className="font-['Outfit'] text-xl sm:text-2xl font-black text-[#12160F] m-0">
              USER &amp; ADMINISTRATOR GOVERNANCE
            </h1>
          </div>
          <p className="text-[#586151] text-xs sm:text-sm m-0">
            Authoritative RBAC management, administrator invitations, and account status governance.
          </p>
        </div>
      </div>

      {/* ── CARD 1: Administrator Management Section ────────────────────── */}
      <div className="fluetas-card p-5 sm:p-6 bg-white border border-[rgba(18,22,15,0.08)] shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(18,22,15,0.08)]">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#D9622B]" />
            <h2 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
              Platform Administrators ({adminsList.length})
            </h2>
          </div>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/20">
            Immutable Audit Logging Active
          </span>
        </div>

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="mb-5">
          <label className="block text-xs font-bold text-[#12160F] mb-1.5">
            Grant Administrator Privileges by Registered Email
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              required
              placeholder="existing-user@example.com"
              value={newAdminEmail}
              onChange={e => setNewAdminEmail(e.target.value)}
              className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-[#12160F] placeholder-[#8A9482] text-xs sm:text-sm focus:border-[#D9622B] outline-none"
            />
            <button
              type="submit"
              disabled={addingAdmin || !newAdminEmail.trim()}
              className="min-h-[42px] px-5 rounded-xl bg-[#D9622B] hover:bg-[#B84E1E] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 shadow-2xs"
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
            <div className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1.5 animate-slide-up">
              <AlertCircle size={14} />
              <span>{adminError}</span>
            </div>
          )}
          {adminSuccess && (
            <div className="mt-2 text-xs text-[#2E7D32] font-semibold flex items-center gap-1.5 animate-slide-up">
              <CheckCircle2 size={14} />
              <span>{adminSuccess}</span>
            </div>
          )}
        </form>

        {/* Existing Admins Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(18,22,15,0.08)] text-[#586151] uppercase text-[0.65rem] tracking-wider font-bold">
                <th className="pb-2.5">Admin</th>
                <th className="pb-2.5">Email</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(18,22,15,0.06)]">
              {adminsList.map(adm => (
                <tr key={adm.id} className="hover:bg-[#FAFAF6] transition-colors">
                  <td className="py-3 pr-3 font-bold text-[#12160F] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/20 flex items-center justify-center font-bold text-xs">
                      {adm.name ? adm.name[0] : 'A'}
                    </div>
                    <span>{adm.name || 'Platform Administrator'}</span>
                    {adm.id === user?.uid && (
                      <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
                        You
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-[#586151] font-mono text-xs">{adm.email}</td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
                      {adm.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {adm.id !== user?.uid && (
                      <button
                        onClick={() => handleRemoveAdmin(adm)}
                        disabled={processingId === adm.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer transition-colors"
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
      <div className="fluetas-card p-5 bg-white border border-[rgba(18,22,15,0.08)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-['Outfit'] text-base font-bold text-[#12160F] m-0">
            All Registered Platform Accounts ({users.length})
          </h2>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9482]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAFAF6] border border-[rgba(18,22,15,0.12)] text-xs text-[#12160F] placeholder-[#8A9482] outline-none focus:border-[#2E7D32]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(18,22,15,0.08)] text-[#586151] uppercase text-[0.65rem] tracking-wider font-bold">
                <th className="pb-3">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(18,22,15,0.06)]">
              {filtered.map(usr => {
                const isSuspended = usr.status === 'suspended';
                const isProcessing = processingId === usr.id;
                return (
                  <tr key={usr.id} className="hover:bg-[#FAFAF6] transition-colors">
                    <td className="py-3.5 pr-3 font-bold text-[#12160F] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] flex items-center justify-center font-bold text-xs text-[#2E7D32]">
                        {usr.name ? usr.name[0] : 'U'}
                      </div>
                      <span>{usr.name || 'User'}</span>
                    </td>
                    <td className="py-3.5 pr-3 text-[#586151] font-mono text-xs">{usr.email}</td>
                    <td className="py-3.5 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${
                        usr.role === 'admin'
                          ? 'bg-[#D9622B]/10 text-[#D9622B] border border-[#D9622B]/20'
                          : usr.role === 'expert' || usr.role === 'doctor'
                          ? 'bg-[#2E6DA4]/10 text-[#2E6DA4] border border-[#2E6DA4]/20'
                          : 'bg-[#FAFAF6] text-[#586151] border border-[rgba(18,22,15,0.08)]'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold ${
                          isSuspended
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
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
                            ? 'bg-[#2E7D32]/10 text-[#2E7D32] hover:bg-[#2E7D32]/20 border border-[#2E7D32]/20'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
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
