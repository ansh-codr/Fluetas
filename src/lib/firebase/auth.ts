import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
 * Creates user doc on first sign-in.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const credential = await signInWithPopup(getAuth(), googleProvider);
  const uid = credential.user.uid;

  // Only create doc if this is a new user
  const isNew = credential.user.metadata.creationTime === credential.user.metadata.lastSignInTime;
  if (isNew) {
    await setDoc(
      doc(getDb(), 'users', uid),
      {
        name: credential.user.displayName ?? '',
        email: credential.user.email ?? '',
        role: 'customer',
        premiumMember: false,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return credential;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  return firebaseSignOut(getAuth());
}
