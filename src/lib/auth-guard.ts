/**
 * Server-Side Authentication & Role Guard for Vercel API Routes
 * Verifies Firebase ID Tokens and enforces role-based access server-side.
 * Authoritative source for roles is strictly Firebase ID Token Custom Claims.
 */

import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from './firebase-admin';
import { apiError } from './api-response';

export type AllowedRole = 'customer' | 'doctor' | 'admin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: AllowedRole;
  status: string;
}

export async function verifyServerSession(request: NextRequest): Promise<
  | { authenticated: true; user: AuthenticatedUser }
  | { authenticated: false; response: ReturnType<typeof apiError> }
> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      response: apiError('UNAUTHORIZED', 'Missing or invalid Authorization header with Bearer token', 401),
    };
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    return {
      authenticated: false,
      response: apiError('UNAUTHORIZED', 'Missing authentication token', 401),
    };
  }

  // Development-only token bypass for local mock testing
  if (!adminAuth) {
    if (process.env.NODE_ENV === 'development' && token.startsWith('dev_token_')) {
      const role = (token.split('dev_token_')[1] || 'customer') as AllowedRole;
      return {
        authenticated: true,
        user: {
          uid: `dev_user_${role}`,
          email: `${role}@fluetas.local`,
          role,
          status: 'active',
        },
      };
    }

    return {
      authenticated: false,
      response: apiError('SERVER_CONFIG_ERROR', 'Firebase Admin Auth is not configured on server. Failing closed.', 500),
    };
  }

  // Strictly reject development bearer tokens in production
  if (process.env.NODE_ENV !== 'development' && token.startsWith('dev_token_')) {
    return {
      authenticated: false,
      response: apiError('INVALID_TOKEN', 'Development tokens are strictly forbidden in production', 401),
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Authoritative Role: Strictly derive from verified custom claims. Default to 'customer'.
    const role: AllowedRole = (decodedToken.role as AllowedRole) || 'customer';
    let status = 'active';

    // Query Firestore solely for non-privilege metadata (e.g. suspension status)
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          if (data?.status) status = data.status;
        }
      } catch (dbErr) {
        console.warn('[auth-guard] Could not check user status in Firestore:', dbErr);
      }
    }

    if (status === 'suspended') {
      return {
        authenticated: false,
        response: apiError('ACCOUNT_SUSPENDED', 'Your account is suspended. Contact support.', 403),
      };
    }

    return {
      authenticated: true,
      user: {
        uid,
        email,
        role,
        status,
      },
    };
  } catch (err: any) {
    return {
      authenticated: false,
      response: apiError('INVALID_TOKEN', 'The provided authentication token is expired or invalid', 401),
    };
  }
}

export async function requireServerRole(
  request: NextRequest,
  allowedRoles: AllowedRole[]
): Promise<
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: ReturnType<typeof apiError> }
> {
  const session = await verifyServerSession(request);
  if (!session.authenticated) {
    return { authorized: false, response: session.response };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      authorized: false,
      response: apiError('FORBIDDEN', `Access restricted to roles: [${allowedRoles.join(', ')}]`, 403),
    };
  }

  return { authorized: true, user: session.user };
}
