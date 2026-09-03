#!/usr/bin/env node

/**
 * Authoritative Admin Role Promotion CLI
 * Usage: node scripts/make-admin.mjs <user-email-or-uid>
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const targetIdentifier = process.argv[2];

if (!targetIdentifier) {
  console.log('Usage: node scripts/make-admin.mjs <user-email-or-uid>');
  process.exit(1);
}

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Error: Missing Firebase Admin environment variables in .env.local');
  process.exit(1);
}

privateKey = privateKey.replace(/\\n/g, '\n');

const app = !getApps().length
  ? initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

async function makeAdmin() {
  console.log(`[Admin Tool] Resolving account for: ${targetIdentifier}...`);
  let userRecord;

  try {
    if (targetIdentifier.includes('@')) {
      userRecord = await auth.getUserByEmail(targetIdentifier.trim().toLowerCase());
    } else {
      userRecord = await auth.getUser(targetIdentifier.trim());
    }
  } catch (err) {
    console.error(`[Admin Tool] User not found: ${err.message}`);
    process.exit(1);
  }

  const uid = userRecord.uid;
  console.log(`[Admin Tool] Found user UID: ${uid} (${userRecord.email})`);

  // 1. Set Custom Claims
  await auth.setCustomUserClaims(uid, {
    role: 'admin',
    admin: true,
  });
  console.log(`[Admin Tool] Firebase Auth custom claims updated: { role: 'admin', admin: true }`);

  // 2. Set Firestore users/{uid}
  await db.collection('users').doc(uid).set(
    {
      role: 'admin',
      status: 'active',
      roleUpdatedAt: FieldValue.serverTimestamp(),
      roleUpdatedBy: 'cli_bootstrap_script',
    },
    { merge: true }
  );
  console.log(`[Admin Tool] Firestore users/${uid} document updated with role: 'admin'`);

  // 3. Write immutable audit log
  await db.collection('auditLogs').add({
    action: 'ADMIN_INITIALIZED',
    actorId: 'cli_bootstrap_script',
    actorRole: 'system',
    targetId: uid,
    targetEmail: userRecord.email,
    timestamp: FieldValue.serverTimestamp(),
    details: `Authoritatively promoted ${userRecord.email} to platform administrator.`,
    result: 'SUCCESS',
  });
  console.log(`[Admin Tool] Audit log entry recorded in /auditLogs`);

  console.log(`\n SUCCESS: User ${userRecord.email} is now a verified platform administrator.`);
  console.log(`They can log in at: /admin/login\n`);
  process.exit(0);
}

makeAdmin().catch(err => {
  console.error('[Admin Tool] Failed:', err);
  process.exit(1);
});
