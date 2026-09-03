import { describe, it, expect } from 'vitest';

export type LoginIntent = 'customer' | 'practitioner';
export type AuthoritativeRole = 'customer' | 'expert' | 'doctor' | 'admin';

/**
 * Pure login intent and role matching engine
 */
export function evaluateLoginIntent(
  intent: LoginIntent,
  authoritativeRole: AuthoritativeRole | null,
  accountStatus: string = 'active'
): {
  allowed: boolean;
  destination?: string;
  errorMessage?: string;
  mustSignOut?: boolean;
} {
  if (accountStatus === 'suspended') {
    return {
      allowed: false,
      errorMessage: 'Your account is currently suspended. Please reach out to support@fluetas.com.',
      mustSignOut: true,
    };
  }

  if (!authoritativeRole) {
    if (intent === 'customer') {
      return { allowed: true, destination: '/dashboard' };
    } else {
      return {
        allowed: false,
        errorMessage: 'No practitioner profile found for this account. Please submit your clinical credentials via Practitioner Registration.',
        mustSignOut: true,
      };
    }
  }

  const role = authoritativeRole.toLowerCase();

  if (intent === 'customer') {
    if (role === 'customer') {
      return { allowed: true, destination: '/dashboard' };
    }
    if (role === 'expert' || role === 'doctor') {
      return {
        allowed: false,
        errorMessage: 'This account is registered as a practitioner. Please select Practitioner login.',
        mustSignOut: true,
      };
    }
    if (role === 'admin') {
      return {
        allowed: false,
        errorMessage: 'This account has administrator privileges. Please use the Admin Portal at /admin/login.',
        mustSignOut: true,
      };
    }
  }

  if (intent === 'practitioner') {
    if (role === 'expert' || role === 'doctor') {
      return { allowed: true, destination: '/doctor/dashboard' };
    }
    if (role === 'customer') {
      return {
        allowed: false,
        errorMessage: 'These credentials are registered as a customer account. Practitioner access is not available.',
        mustSignOut: true,
      };
    }
    if (role === 'admin') {
      return {
        allowed: false,
        errorMessage: 'This account has administrator privileges. Please use the Admin Portal at /admin/login.',
        mustSignOut: true,
      };
    }
  }

  return {
    allowed: false,
    errorMessage: 'Unrecognized account authorization. Please contact support.',
    mustSignOut: true,
  };
}

/**
 * Pure Route Access Matrix Evaluator for Zero-Flash Guard
 */
export function evaluateRouteAccess(
  pathname: string,
  user: { uid: string } | null,
  role: string | null,
  accountStatus: string = 'active'
): {
  canRender: boolean;
  redirectTo?: string;
} {
  // Gate 1: Unauthenticated
  if (!user) {
    if (pathname.startsWith('/admin')) {
      return { canRender: false, redirectTo: '/admin/login' };
    }
    return { canRender: false, redirectTo: '/login' };
  }

  // Gate 2: Resolving
  if (!role) {
    return { canRender: false }; // wait in zero-flash loading screen
  }

  // Gate 3: Suspended
  if (accountStatus === 'suspended') {
    return { canRender: false };
  }

  const normRole = role.toLowerCase();
  const isPractitioner = normRole === 'doctor' || normRole === 'expert';
  const isCustomer = normRole === 'customer';
  const isAdmin = normRole === 'admin';

  const isDoctorRoute = pathname.startsWith('/doctor') || pathname.startsWith('/expert');
  const isAdminRoute = pathname.startsWith('/admin');
  const isCustomerRoute = !isDoctorRoute && !isAdminRoute;

  // Rule A: Customer attempting Doctor or Admin route
  if (isCustomer && (isDoctorRoute || isAdminRoute)) {
    return { canRender: false, redirectTo: '/dashboard' };
  }

  // Rule B: Practitioner attempting Customer or Admin route
  if (isPractitioner && (isCustomerRoute || isAdminRoute)) {
    return { canRender: false, redirectTo: '/doctor/dashboard' };
  }

  // Rule C: Admin attempting Customer or Doctor route
  if (isAdmin && (isCustomerRoute || isDoctorRoute)) {
    return { canRender: false, redirectTo: '/admin/dashboard' };
  }

  // Rule D: Non-admin attempting Admin route
  if (!isAdmin && isAdminRoute) {
    return { canRender: false, redirectTo: '/admin/login' };
  }

  // Permitted
  return { canRender: true };
}

describe('FLUETAS Authentication, Role Matching & Route Guard Matrix', () => {
  describe('Login Intent Validation', () => {
    it('TEST 1: allows customer account when Customer intent is selected', () => {
      const res = evaluateLoginIntent('customer', 'customer');
      expect(res.allowed).toBe(true);
      expect(res.destination).toBe('/dashboard');
    });

    it('TEST 2: rejects customer account when Practitioner intent is selected', () => {
      const res = evaluateLoginIntent('practitioner', 'customer');
      expect(res.allowed).toBe(false);
      expect(res.mustSignOut).toBe(true);
      expect(res.errorMessage).toContain('registered as a customer account');
    });

    it('TEST 3: allows practitioner account when Practitioner intent is selected', () => {
      const res1 = evaluateLoginIntent('practitioner', 'expert');
      expect(res1.allowed).toBe(true);
      expect(res1.destination).toBe('/doctor/dashboard');

      const res2 = evaluateLoginIntent('practitioner', 'doctor');
      expect(res2.allowed).toBe(true);
      expect(res2.destination).toBe('/doctor/dashboard');
    });

    it('TEST 4: rejects practitioner account when Customer intent is selected', () => {
      const res1 = evaluateLoginIntent('customer', 'expert');
      expect(res1.allowed).toBe(false);
      expect(res1.mustSignOut).toBe(true);
      expect(res1.errorMessage).toContain('registered as a practitioner');

      const res2 = evaluateLoginIntent('customer', 'doctor');
      expect(res2.allowed).toBe(false);
      expect(res2.mustSignOut).toBe(true);
      expect(res2.errorMessage).toContain('registered as a practitioner');
    });

    it('TEST 5: rejects admin account from main login with explicit redirect to /admin/login', () => {
      const resCust = evaluateLoginIntent('customer', 'admin');
      expect(resCust.allowed).toBe(false);
      expect(resCust.mustSignOut).toBe(true);
      expect(resCust.errorMessage).toContain('/admin/login');

      const resPrac = evaluateLoginIntent('practitioner', 'admin');
      expect(resPrac.allowed).toBe(false);
      expect(resPrac.mustSignOut).toBe(true);
      expect(resPrac.errorMessage).toContain('/admin/login');
    });

    it('TEST 6: rejects suspended accounts immediately', () => {
      const res = evaluateLoginIntent('customer', 'customer', 'suspended');
      expect(res.allowed).toBe(false);
      expect(res.mustSignOut).toBe(true);
      expect(res.errorMessage).toContain('suspended');
    });

    it('TEST 7: rejects unknown Google login attempting practitioner without registered profile', () => {
      const res = evaluateLoginIntent('practitioner', null);
      expect(res.allowed).toBe(false);
      expect(res.mustSignOut).toBe(true);
      expect(res.errorMessage).toContain('No practitioner profile found');
    });
  });

  describe('Zero-Flash Route Guard Access Matrix', () => {
    const mockUser = { uid: 'usr_123' };

    it('TEST 8: blocks rendering while role is null/resolving', () => {
      const res = evaluateRouteAccess('/dashboard', mockUser, null);
      expect(res.canRender).toBe(false);
      expect(res.redirectTo).toBeUndefined(); // stays on neutral loading screen
    });

    it('TEST 9: redirects unauthenticated users to login without rendering dashboard', () => {
      const res = evaluateRouteAccess('/dashboard', null, null);
      expect(res.canRender).toBe(false);
      expect(res.redirectTo).toBe('/login');

      const adminRes = evaluateRouteAccess('/admin/dashboard', null, null);
      expect(adminRes.canRender).toBe(false);
      expect(adminRes.redirectTo).toBe('/admin/login');
    });

    it('TEST 10: permits customer to render customer routes, blocks doctor & admin routes', () => {
      expect(evaluateRouteAccess('/dashboard', mockUser, 'customer').canRender).toBe(true);
      expect(evaluateRouteAccess('/profile', mockUser, 'customer').canRender).toBe(true);
      expect(evaluateRouteAccess('/fluetas-train', mockUser, 'customer').canRender).toBe(true);

      const doctorAttempt = evaluateRouteAccess('/doctor/dashboard', mockUser, 'customer');
      expect(doctorAttempt.canRender).toBe(false);
      expect(doctorAttempt.redirectTo).toBe('/dashboard');

      const adminAttempt = evaluateRouteAccess('/admin/doctors', mockUser, 'customer');
      expect(adminAttempt.canRender).toBe(false);
      expect(adminAttempt.redirectTo).toBe('/dashboard');
    });

    it('TEST 11: permits practitioner to render doctor routes, blocks customer dashboard & profile', () => {
      expect(evaluateRouteAccess('/doctor/dashboard', mockUser, 'expert').canRender).toBe(true);
      expect(evaluateRouteAccess('/doctor/patients', mockUser, 'doctor').canRender).toBe(true);

      const customerDashAttempt = evaluateRouteAccess('/dashboard', mockUser, 'expert');
      expect(customerDashAttempt.canRender).toBe(false);
      expect(customerDashAttempt.redirectTo).toBe('/doctor/dashboard');

      const customerProfileAttempt = evaluateRouteAccess('/profile', mockUser, 'expert');
      expect(customerProfileAttempt.canRender).toBe(false);
      expect(customerProfileAttempt.redirectTo).toBe('/doctor/dashboard');
    });

    it('TEST 12: permits admin to render admin routes, blocks rendering non-admin dashboards', () => {
      expect(evaluateRouteAccess('/admin/dashboard', mockUser, 'admin').canRender).toBe(true);
      expect(evaluateRouteAccess('/admin/doctors', mockUser, 'admin').canRender).toBe(true);

      const custAttempt = evaluateRouteAccess('/dashboard', mockUser, 'admin');
      expect(custAttempt.canRender).toBe(false);
      expect(custAttempt.redirectTo).toBe('/admin/dashboard');
    });
  });
});
