import { createContext } from 'react';
import type { SessionState } from './types';

export interface AuthContextType {
  sessionState: SessionState;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  extendSession: () => Promise<void>;
  resetIdleTimer: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
