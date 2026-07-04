import React from 'react';
import './Foundation.css';

export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'pending';
  label: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = ''
}) => {
  return (
    <span className={`lims-status-badge status-${status} ${className}`} role="status">
      <span style={{ fontSize: '0.65rem' }}>●</span>
      <span>{label}</span>
    </span>
  );
};
