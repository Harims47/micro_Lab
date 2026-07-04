import type { UserRole } from '../../types';

export interface UserPreferences {
  theme: 'light' | 'dark';
  density: 'comfortable' | 'compact' | 'high-density';
}

export interface UserLaboratory {
  id: string;
  name: string;
  code: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  email: string;
  activeRole: UserRole;
  preferences: UserPreferences;
  laboratory: UserLaboratory;
}

export type SessionState =
  | 'UNKNOWN'
  | 'AUTHENTICATING'
  | 'AUTHENTICATED'
  | 'REFRESHING'
  | 'IDLE_WARNING'
  | 'EXPIRED'
  | 'LOCKED'
  | 'LOGGED_OUT';

export const AuthEvent = {
  LOGIN_SUCCESS: 'auth:login_success',
  LOGIN_FAILED: 'auth:login_failed',
  LOGOUT: 'auth:logout',
  SESSION_REFRESH: 'auth:session_refresh',
  SESSION_EXPIRED: 'auth:session_expired',
  ACCOUNT_LOCKED: 'auth:account_locked',
  PASSWORD_CHANGED: 'auth:password_changed',
} as const;

export type AuthEvent = typeof AuthEvent[keyof typeof AuthEvent];
