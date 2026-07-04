import { createContext } from 'react';
import type { UserRole } from '../../types';
import { Permission } from './constants';

export interface PermissionContextType {
  role: UserRole | null;
  permissionsMask: number;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

export const PermissionContext = createContext<PermissionContextType | undefined>(undefined);
