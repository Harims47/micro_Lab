import { mockAdapter } from './mockAdapter';
import { UserRole } from '../../types';

// Structured mock users database mapping username to password
const mockCredentials: Record<
  string,
  { password: string; role: UserRole; name: string; email: string; id: string }
> = {
  registrar_user: {
    id: 'USR-001',
    password: 'password123',
    role: UserRole.REGISTRAR,
    name: 'Sarah Connor',
    email: 's.connor@microlab.org',
  },
  tech_user: {
    id: 'USR-002',
    password: 'password123',
    role: UserRole.TECHNICIAN,
    name: 'John Miller',
    email: 'j.miller@microlab.org',
  },
  supervisor_user: {
    id: 'USR-003',
    password: 'password123',
    role: UserRole.SUPERVISOR,
    name: 'Elena Rostova',
    email: 'e.rostova@microlab.org',
  },
  pathologist_user: {
    id: 'USR-004',
    password: 'password123',
    role: UserRole.PATHOLOGIST,
    name: 'Dr. Gregory House',
    email: 'g.house@microlab.org',
  },
  finance_user: {
    id: 'USR-005',
    password: 'password123',
    role: UserRole.FINANCE,
    name: 'Christian Bale',
    email: 'c.bale@microlab.org',
  },
};

export const initializeMockAuthServer = () => {
  // ─── POST /login ─────────────────────────────────────────────────────────────
  mockAdapter.register('POST', '/login', (body: any) => {
    const { username, password } = body || {};

    if (!username) {
      throw { status: 400, message: 'Username is required' };
    }

    // 1. Simulate server error
    if (username === 'server_error') {
      throw { status: 500, message: 'Internal Server Error' };
    }

    // 2. Simulate disabled user
    if (username === 'disabled_user') {
      throw { status: 403, message: 'User account is disabled. Contact system administrator.' };
    }

    // 3. Simulate locked account
    if (username === 'locked_user') {
      throw { status: 403, message: 'Account is locked due to security policy constraints.' };
    }

    // 4. Simulate expired password
    if (username === 'expired_password_user') {
      throw { status: 401, message: 'Password has expired. Please reset your password.' };
    }

    const creds = mockCredentials[username];

    // 5. Invalid credentials checks
    if (!creds || password !== creds.password) {
      throw { status: 401, message: 'Invalid username or security passcode.' };
    }

    // Success response returning AuthenticatedUser context shape
    return {
      user: {
        id: creds.id,
        username,
        name: creds.name,
        email: creds.email,
        activeRole: creds.role,
        preferences: {
          theme: 'light',
          density: 'comfortable',
        },
        laboratory: {
          id: 'LAB-001',
          name: 'Microbiology Central Lab',
          code: 'MCL',
        },
      },
      accessToken: `mock_jwt_access_token_${username}_${Date.now()}`,
      refreshToken: `mock_jwt_refresh_token_${username}_${Date.now()}`,
    };
  }, { latencyMs: 120 });

  // ─── POST /logout ────────────────────────────────────────────────────────────
  mockAdapter.register('POST', '/logout', () => {
    return { success: true };
  }, { latencyMs: 40 });

  // ─── POST /refresh-token ─────────────────────────────────────────────────────
  mockAdapter.register('POST', '/refresh-token', (body: any) => {
    const { refreshToken } = body || {};

    if (!refreshToken) {
      throw { status: 401, message: 'Refresh token missing.' };
    }

    // Simulate expired refresh token scenario
    if (refreshToken.includes('expired_refresh_user')) {
      throw { status: 401, message: 'Refresh session has expired. Please log in again.' };
    }

    // Resolve username from refresh token
    const parts = refreshToken.split('_');
    const username = parts[4] || 'tech_user';
    const creds = mockCredentials[username] || mockCredentials.tech_user;

    return {
      user: {
        id: creds.id,
        username,
        name: creds.name,
        email: creds.email,
        activeRole: creds.role,
        preferences: {
          theme: 'light',
          density: 'comfortable',
        },
        laboratory: {
          id: 'LAB-001',
          name: 'Microbiology Central Lab',
          code: 'MCL',
        },
      },
      accessToken: `mock_jwt_access_token_${username}_${Date.now()}`,
      refreshToken: `mock_jwt_refresh_token_${username}_${Date.now()}`,
    };
  }, { latencyMs: 80 });

  // ─── POST /forgot-password ───────────────────────────────────────────────────
  mockAdapter.register('POST', '/forgot-password', (body: any) => {
    const { email } = body || {};
    if (!email) {
      throw { status: 400, message: 'Email address is required.' };
    }
    return { success: true, message: 'Recovery email dispatched.' };
  }, { latencyMs: 100 });

  // ─── POST /reset-password ─────────────────────────────────────────────────────
  mockAdapter.register('POST', '/reset-password', (body: any) => {
    const { token, newPassword } = body || {};
    if (!token || !newPassword) {
      throw { status: 400, message: 'Token and new password are required.' };
    }
    return { success: true, message: 'Password updated.' };
  }, { latencyMs: 110 });

  // ─── POST /change-password ────────────────────────────────────────────────────
  mockAdapter.register('POST', '/change-password', (body: any) => {
    const { oldPassword, newPassword } = body || {};
    if (!oldPassword || !newPassword) {
      throw { status: 400, message: 'Old and new passwords are required.' };
    }
    return { success: true, message: 'Password changed successfully.' };
  }, { latencyMs: 100 });
};
