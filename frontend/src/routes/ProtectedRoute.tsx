import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIdentity, useAuth } from '../infrastructure/auth';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useIdentity();
  const { sessionState } = useAuth();

  // 1. Loading/Verifying session state
  if (sessionState === 'UNKNOWN' || sessionState === 'AUTHENTICATING' || sessionState === 'REFRESHING') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface-base, #0f172a)',
        }}
      >
        <div style={{ font: 'var(--type-body-default)', color: 'var(--color-text-secondary)' }}>
          Verifying security context...
        </div>
      </div>
    );
  }

  // 2. Account locked transition
  if (sessionState === 'LOCKED') {
    return <Navigate to="/account-locked" replace />;
  }

  // 3. Unauthenticated redirects
  if (!user || sessionState === 'LOGGED_OUT' || sessionState === 'EXPIRED') {
    return <Navigate to="/login" replace />;
  }

  // 4. Role authorization redirects
  if (allowedRoles && !allowedRoles.includes(user.activeRole)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
