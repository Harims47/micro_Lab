import React, { useMemo } from 'react';
import type { UserRole } from '../../types';
import { Permission, ROLE_PERMISSIONS, hasBit } from './constants';
import { PermissionContext, type PermissionContextType } from './PermissionContext';

interface PermissionProviderProps {
  children: React.ReactNode;
  activeRole: UserRole | null;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
  activeRole,
}) => {
  const permissionsMask = useMemo(() => {
    if (!activeRole) return 0;
    return ROLE_PERMISSIONS[activeRole] ?? 0;
  }, [activeRole]);

  const hasPermission = useCallback(
    (permission: Permission) => {
      return hasBit(permissionsMask, permission);
    },
    [permissionsMask]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]) => {
      return permissions.some((p) => hasBit(permissionsMask, p));
    },
    [permissionsMask]
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]) => {
      return permissions.every((p) => hasBit(permissionsMask, p));
    },
    [permissionsMask]
  );

  const contextValue = useMemo<PermissionContextType>(
    () => ({
      role: activeRole,
      permissionsMask,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [activeRole, permissionsMask, hasPermission, hasAnyPermission, hasAllPermissions]
  );

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

// Simple React helper helper since useCallback isn't imported from React directly
import { useCallback } from 'react';
