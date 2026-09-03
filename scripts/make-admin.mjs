import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually parse .env.local without external dependencies
const envPath = resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
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

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function makeAdmin(identifier) {
  if (!identifier) {
    console.error('Usage: node scripts/make-admin.mjs <user-email-or-uid>');
    process.exit(1);
  }

  let userRecord;
  try {
    if (identifier.includes('@')) {
      userRecord = await auth.getUserByEmail(identifier);
    } else {
      userRecord = await auth.getUser(identifier);
    }
  } catch (err) {
    console.error(`User not found in Firebase Auth for identifier: "${identifier}"`);
    console.error('Please ensure this account has signed up or registered first.');
    process.exit(1);
  }

  const uid = userRecord.uid;
  console.log(`Found user: ${userRecord.email || uid} (${uid})`);

  // 1. Set Custom Claims on Firebase Auth
  await auth.setCustomUserClaims(uid, { role: 'admin' });
  console.log('✔ Custom claims updated: role = "admin"');

  // 2. Set Firestore document
  await db.collection('users').doc(uid).set(
    {
      role: 'admin',
      roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`✔ Firestore document updated: users/${uid}.role = "admin"`);

  console.log('\nSUCCESS: User has been granted Administrator permissions!');
  console.log('When this user signs in at /login, they will be routed directly to /admin/dashboard.');
  console.log('From there, visit /admin/doctors to review all practitioner submissions.');
  process.exit(0);
}

const arg = process.argv[2];
makeAdmin(arg);
