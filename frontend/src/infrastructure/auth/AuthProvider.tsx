import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SessionState } from './types';
import { AuthEvent } from './types';
import { AuthContext, type AuthContextType } from './AuthContext';
import { useIdentity } from './useIdentity';
import { TokenStorageInstance } from './TokenStorage';
import { httpClient } from '../http/httpClient';
import { AuthEventBus } from './AuthEventBus';
import { appConfig } from '../config/appConfig';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser } = useIdentity();
  const [sessionState, setSessionState] = useState<SessionState>('UNKNOWN');
  const consecutiveFailuresRef = useRef<number>(0);

  // References to handle idle tracking
  const lastActivityRef = useRef<number>(Date.now());
  const idleCheckIntervalRef = useRef<number | null>(null);

  // References to handle token refresh timer
  const refreshTimerRef = useRef<number | null>(null);

  // ─── Token Persistence & Auto Login ──────────────────────────────────────────

  // Perform session restore on mount
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = TokenStorageInstance.getRefreshToken();
      if (!refreshToken) {
        setSessionState('LOGGED_OUT');
        return;
      }

      setSessionState('REFRESHING');
      try {
        const response = await httpClient.post<{
          user: any;
          accessToken: string;
          refreshToken: string;
        }>('/refresh-token', { refreshToken });

        TokenStorageInstance.saveAccessToken(response.data.accessToken);
        TokenStorageInstance.saveRefreshToken(response.data.refreshToken);
        setUser(response.data.user);
        setSessionState('AUTHENTICATED');
        lastActivityRef.current = Date.now();
        AuthEventBus.emit(AuthEvent.LOGIN_SUCCESS, response.data.user);
      } catch {
        // Session expired or invalid
        TokenStorageInstance.clearTokens();
        setUser(null);
        setSessionState('LOGGED_OUT');
      }
    };

    restoreSession();
  }, [setUser]);

  // ─── Auth Action Implementations ──────────────────────────────────────────────

  const login = useCallback(
    async (username: string, password: string, rememberMe: boolean = false) => {
      // Check lockout threshold locally before request
      if (consecutiveFailuresRef.current >= 3) {
        setSessionState('LOCKED');
        AuthEventBus.emit(AuthEvent.ACCOUNT_LOCKED, { username });
        throw new Error('ERR-LOCK: Account is temporarily locked. Too many failed attempts.');
      }

      setSessionState('AUTHENTICATING');
      try {
        const response = await httpClient.post<{
          user: any;
          accessToken: string;
          refreshToken: string;
        }>('/login', { username, password, rememberMe });

        consecutiveFailuresRef.current = 0; // Reset counter
        TokenStorageInstance.saveAccessToken(response.data.accessToken);
        TokenStorageInstance.saveRefreshToken(response.data.refreshToken);
        setUser(response.data.user);
        setSessionState('AUTHENTICATED');
        lastActivityRef.current = Date.now();
        AuthEventBus.emit(AuthEvent.LOGIN_SUCCESS, response.data.user);
      } catch (err: any) {
        consecutiveFailuresRef.current += 1;

        if (consecutiveFailuresRef.current >= 3) {
          setSessionState('LOCKED');
          AuthEventBus.emit(AuthEvent.ACCOUNT_LOCKED, { username });
          throw new Error('ERR-LOCK: Account locked due to 3 consecutive failed login attempts.');
        }

        setSessionState('LOGGED_OUT');
        AuthEventBus.emit(AuthEvent.LOGIN_FAILED, { username });
        throw err;
      }
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    // Save token reference before clearing to hit logout endpoint if possible
    const refreshToken = TokenStorageInstance.getRefreshToken();
    
    // Immediate state transition
    TokenStorageInstance.clearTokens();
    setUser(null);
    setSessionState('LOGGED_OUT');
    AuthEventBus.emit(AuthEvent.LOGOUT);

    if (refreshToken) {
      try {
        await httpClient.post('/logout', { refreshToken });
      } catch {
        // Silent catch on network failure during logout
      }
    }
  }, [setUser]);

  const forgotPassword = useCallback(async (email: string) => {
    await httpClient.post('/forgot-password', { email });
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await httpClient.post('/reset-password', { token, newPassword });
    AuthEventBus.emit(AuthEvent.PASSWORD_CHANGED);
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    await httpClient.post('/change-password', { oldPassword, newPassword });
    AuthEventBus.emit(AuthEvent.PASSWORD_CHANGED);
  }, []);

  const extendSession = useCallback(async () => {
    const refreshToken = TokenStorageInstance.getRefreshToken();
    if (!refreshToken) {
      await logout();
      return;
    }

    setSessionState('REFRESHING');
    try {
      const response = await httpClient.post<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>('/refresh-token', { refreshToken });

      TokenStorageInstance.saveAccessToken(response.data.accessToken);
      TokenStorageInstance.saveRefreshToken(response.data.refreshToken);
      setSessionState('AUTHENTICATED');
      lastActivityRef.current = Date.now();
      AuthEventBus.emit(AuthEvent.SESSION_REFRESH, response.data.user);
    } catch {
      setSessionState('EXPIRED');
      await logout();
      AuthEventBus.emit(AuthEvent.SESSION_EXPIRED);
    }
  }, [logout]);

  const resetIdleTimer = useCallback(() => {
    if (sessionState === 'AUTHENTICATED') {
      lastActivityRef.current = Date.now();
    }
  }, [sessionState]);

  // ─── Idle Timer & Session Expiration ────────────────────────────────────────

  // Track page activity actions
  useEffect(() => {
    if (sessionState !== 'AUTHENTICATED') return;

    const handleActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [sessionState, resetIdleTimer]);

  // Monitor inactivity intervals
  useEffect(() => {
    if (sessionState !== 'AUTHENTICATED' && sessionState !== 'IDLE_WARNING') {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
        idleCheckIntervalRef.current = null;
      }
      return;
    }

    const { timeoutMs, warningMs } = appConfig.session;
    const warningThresholdMs = timeoutMs - warningMs;

    idleCheckIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= timeoutMs) {
        setSessionState('EXPIRED');
        logout();
        AuthEventBus.emit(AuthEvent.SESSION_EXPIRED);
      } else if (elapsed >= warningThresholdMs && sessionState !== 'IDLE_WARNING') {
        setSessionState('IDLE_WARNING');
      }
    }, 5000); // Check every 5s

    return () => {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
        idleCheckIntervalRef.current = null;
      }
    };
  }, [sessionState, logout]);

  // ─── Background Token Auto-Refresh ──────────────────────────────────────────

  useEffect(() => {
    if (sessionState !== 'AUTHENTICATED') {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      return;
    }

    // Access token has 15 minute lifespan. Trigger refresh every 14 minutes.
    const refreshIntervalMs = 14 * 60 * 1000;

    refreshTimerRef.current = window.setInterval(async () => {
      const refreshToken = TokenStorageInstance.getRefreshToken();
      if (!refreshToken) return;

      try {
        const response = await httpClient.post<{
          user: any;
          accessToken: string;
          refreshToken: string;
        }>('/refresh-token', { refreshToken }, { dedupe: 'auto-refresh' });

        TokenStorageInstance.saveAccessToken(response.data.accessToken);
        TokenStorageInstance.saveRefreshToken(response.data.refreshToken);
        AuthEventBus.emit(AuthEvent.SESSION_REFRESH, response.data.user);
      } catch {
        // Auto refresh failed, let the idle timer eventually log the user out
      }
    }, refreshIntervalMs);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [sessionState]);

  // ─── Multi-Tab Session Synchronization ──────────────────────────────────────

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lims_refresh_token' && e.newValue === null) {
        // Invalidate session immediately if token cleared in another tab
        logout();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [logout]);

  const contextValue = React.useMemo<AuthContextType>(
    () => ({
      sessionState,
      login,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
      extendSession,
      resetIdleTimer,
    }),
    [
      sessionState,
      login,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
      extendSession,
      resetIdleTimer,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
