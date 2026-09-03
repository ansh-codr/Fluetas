'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User, IdTokenResult, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export type UserRole = 'customer' | 'doctor' | 'expert' | 'admin' | null;
export type AccountStatus = 'active' | 'pending' | 'suspended' | 'deactivated';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended' | null;
export type AuthStateStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface UserAccountData {
  userId: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  verificationStatus?: VerificationStatus;
  doctorId?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  status: AccountStatus;
  authStatus: AuthStateStatus;
  verificationStatus: VerificationStatus;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
  setDevRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  status: 'active',
  authStatus: 'loading',
  verificationStatus: null,
  loading: true,
  logout: async () => {},
  refreshUserRole: async () => {},
  setDevRole: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [status, setStatus] = useState<AccountStatus>('active');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [authStatus, setAuthStatus] = useState<AuthStateStatus>('loading');
  const [loading, setLoading] = useState(true);

  // Authoritatively resolve user role, account status, and practitioner verification from Firestore
  const resolveUserAuthorization = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUser(null);
      setRole(null);
      setStatus('active');
      setVerificationStatus(null);
      setAuthStatus('unauthenticated');
      setLoading(false);
      return;
    }

    try {
      // 1. Check Custom Claims on verified Firebase ID Token first
      const tokenResult: IdTokenResult = await firebaseUser.getIdTokenResult();
      const claimRole = tokenResult.claims.role ? String(tokenResult.claims.role).toLowerCase() : undefined;

      let resolvedRole: UserRole = null;
      let resolvedStatus: AccountStatus = (tokenResult.claims.status as AccountStatus) || 'active';
      let resolvedVerification: VerificationStatus = null;

      if (claimRole && ['customer', 'doctor', 'expert', 'admin'].includes(claimRole)) {
        resolvedRole = claimRole as UserRole;
      }

      // 2. Query Firestore /users/{uid} document for authoritative data
      if (db) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const dbRole = data.role ? String(data.role).toLowerCase() : null;
            if (dbRole && ['customer', 'doctor', 'expert', 'admin'].includes(dbRole)) {
              resolvedRole = dbRole as UserRole;
            }
            if (data.status) {
              resolvedStatus = data.status as AccountStatus;
            }
          }
        } catch (dbErr) {
          console.warn('[AuthContext] Firestore users query warning:', dbErr);
        }
      }

      // 3. If practitioner (expert/doctor), query /experts/{uid} to resolve verification status
      if ((resolvedRole === 'expert' || resolvedRole === 'doctor') && db) {
        try {
          const expertDocRef = doc(db, 'experts', firebaseUser.uid);
          const expertSnap = await getDoc(expertDocRef);
          if (expertSnap.exists()) {
            const expData = expertSnap.data();
            const rawVerif = expData.verificationStatus ? String(expData.verificationStatus).toLowerCase() : 'pending';
            if (['pending', 'verified', 'rejected', 'suspended'].includes(rawVerif)) {
              resolvedVerification = rawVerif as VerificationStatus;
            } else {
              resolvedVerification = 'pending';
            }
          } else {
            resolvedVerification = 'pending';
          }
        } catch (expErr) {
          console.warn('[AuthContext] Firestore experts query warning:', expErr);
          resolvedVerification = 'pending';
        }
      }

      setUser(firebaseUser);
      setRole(resolvedRole);
      setStatus(resolvedStatus);
      setVerificationStatus(resolvedVerification);
      setAuthStatus('authenticated');
    } catch (err) {
      console.warn('[AuthContext] Role resolution exception:', err);
      // On error, do NOT assume customer role
      setUser(firebaseUser);
      setRole(null);
      setAuthStatus('authenticated');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setAuthStatus('unauthenticated');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await resolveUserAuthorization(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
        setStatus('active');
        setVerificationStatus(null);
        setAuthStatus('unauthenticated');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [resolveUserAuthorization]);

  // Comprehensive Logout: Clears auth state, Firebase session, and caches
  const logout = useCallback(async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.warn('[AuthContext] Error signing out from Firebase:', err);
    } finally {
      setUser(null);
      setRole(null);
      setStatus('active');
      setVerificationStatus(null);
      setAuthStatus('unauthenticated');
      setLoading(false);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.clear();
        } catch {}
      }
    }
  }, []);

  // Forces Firebase token refresh after server-side role changes
  const refreshUserRole = async () => {
    if (!user) return;
    try {
      await user.getIdToken(true);
      await resolveUserAuthorization(user);
    } catch (err) {
      console.warn('[AuthContext] refreshUserRole error:', err);
    }
  };

  // Development-only mock persona switcher
  const setDevRole = async (newRole: UserRole) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('[AuthContext] Persona switching is disabled in production.');
      return;
    }
    setRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        status,
        authStatus,
        verificationStatus,
        loading,
        logout,
        refreshUserRole,
        setDevRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
