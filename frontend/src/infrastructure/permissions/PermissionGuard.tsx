import React from 'react';
import { usePermission } from './usePermission';
import { Permission } from './constants';
import { ErrorPage403 } from '../errors/ErrorPages';

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Single permission or list of permissions required */
  allowed: Permission | Permission[];
  /** If true, user needs ALL listed permissions, otherwise ANY is sufficient. Defaults to false. */
  requireAll?: boolean;
  /** Custom fallback to render if denied. If omitted, renders ErrorPage403. Pass null to render nothing. */
  fallback?: React.ReactNode;
}

/**
 * Guard component to protect entire pages or UI subtrees.
 *
 * @example
 *   <PermissionGuard allowed={Permission.RELEASE_REPORT}>
 *     <ReleaseReportButton />
 *   </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  allowed,
  requireAll = false,
  fallback,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  let isAllowed = false;

  if (allowedList.length === 1) {
    isAllowed = hasPermission(allowedList[0]);
  } else if (requireAll) {
    isAllowed = hasAllPermissions(allowedList);
  } else {
    isAllowed = hasAnyPermission(allowedList);
  }

  if (!isAllowed) {
    if (fallback === null) return null;
    return (fallback as React.ReactElement) ?? <ErrorPage403 />;
  }

  return <>{children}</>;
};
