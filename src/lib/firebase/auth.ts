import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  UserCredential,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

function getAuth() {
  if (!auth) throw new Error('Firebase not configured. Add your credentials to .env.local');
  return auth;
}
function getDb() {
  if (!db) throw new Error('Firebase not configured. Add your credentials to .env.local');
  return db;
}

const googleProvider = new GoogleAuthProvider();

/**
 * Sign up with email + password.
 * Creates the /users/{uid} document with role: 'customer'.
 */
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(getAuth(), email, password);
  const uid = credential.user.uid;

  await setDoc(doc(getDb(), 'users', uid), {
    name,
    email,
    role: 'customer',
    premiumMember: false,
    createdAt: serverTimestamp(),
  });

  return credential;
}

/**
 * Sign in with email + password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(getAuth(), email, password);
}

/**
 * Sign in with Google popup.
 * Authenticates identity only; role resolution and profile provisioning are handled authoritatively by the caller.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(getAuth(), googleProvider);
}

/**
 * Creates default customer user document if first-time customer registration.
 */
export async function createCustomerProfileIfNew(user: User): Promise<void> {
  const userRef = doc(getDb(), 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName ?? '',
      email: user.email ?? '',
      role: 'customer',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  return firebaseSignOut(getAuth());
}

export interface ExpertRegistrationPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  professionalRole: 'DOCTOR' | 'GYNECOLOGIST' | 'PHYSIOTHERAPIST' | 'NUTRITIONIST' | 'TRAINER' | string;
  specialization: string;
  qualification: string;
  registrationNumber: string;
  registrationAuthority: string;
  experience: string;
  bio: string;
  languages: string[];
  consultationType: string;
  durationMinutes: number;
  workingDays: string[];
  workingHours: { start: string; end: string };
  breakPeriods?: string;
  documentNames?: string[];
  documentUrls?: string[];
}

/**
 * Multi-Step Expert Registration
 * Creates Firebase Auth user, /users/{uid} with role: 'expert', and /experts/{uid} with verificationStatus: 'pending'.
 */
export async function registerExpertAccount(payload: ExpertRegistrationPayload): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(getAuth(), payload.email, payload.password);
  const uid = credential.user.uid;

  // 1. Create top-level /users/{uid} record
  await setDoc(doc(getDb(), 'users', uid), {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: 'expert',
    status: 'active',
    createdAt: serverTimestamp(),
  });

  // 2. Create pending practitioner record in /experts/{uid}
  await setDoc(doc(getDb(), 'experts', uid), {
    id: uid,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    professionalRole: payload.professionalRole,
    specialization: payload.specialization,
    qualification: payload.qualification,
    registrationNumber: payload.registrationNumber,
    registrationAuthority: payload.registrationAuthority,
    experience: payload.experience,
    bio: payload.bio,
    languages: payload.languages,
    consultationType: payload.consultationType,
    durationMinutes: payload.durationMinutes,
    workingDays: payload.workingDays,
    workingHours: payload.workingHours,
    breakPeriods: payload.breakPeriods || '',
    documentNames: payload.documentNames || [],
    documentUrls: payload.documentUrls || [],
    verificationStatus: 'pending',
    appliedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential;
}

