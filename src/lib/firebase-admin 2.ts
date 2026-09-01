/**
 * Firebase Admin SDK — Server-Side Only
 * Initialized once per serverless instance in Vercel.
 * Uses Firebase Admin modular SDK.
 * Never import this file into Client Components.
 */

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

function getAdminCredentials() {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_CLIENT_EMAIL;

  let privateKey =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Replace literal escaped newlines if passed in single-line env var format
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  return { projectId, clientEmail, privateKey };
}

function initFirebaseAdmin(): App | null {
  if (getApps().length > 0) {
    return getApp();
  }

  const { projectId, clientEmail, privateKey } = getAdminCredentials();

  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (err) {
      console.warn('[FirebaseAdmin] Initialization with cert error:', err);
    }
  }

  // Fallback for local dev when running with basic project ID
  if (projectId) {
    try {
      return initializeApp({
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (err) {
      console.warn('[FirebaseAdmin] Initialization with projectId error:', err);
    }
  }

  return null;
}

const adminApp = initFirebaseAdmin();

export const adminAuth: Auth | null = adminApp ? getAuth(adminApp) : null;
export const adminDb: Firestore | null = adminApp ? getFirestore(adminApp) : null;
export const adminStorage: Storage | null = adminApp ? getStorage(adminApp) : null;

export default adminApp;
