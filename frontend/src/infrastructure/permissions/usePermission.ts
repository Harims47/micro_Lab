import { useContext } from 'react';
import { PermissionContext } from './PermissionContext';

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};
