import React from 'react';
import './Laboratory.css';
import { SpecimenStatus } from '../../types';

export interface SpecimenStatusBadgeProps {
  status: SpecimenStatus;
  className?: string;
}

export const SpecimenStatusBadge: React.FC<SpecimenStatusBadgeProps> = ({
  status,
  className = ''
}) => {
  // Determine standard base class matching CSS definitions
  const getBadgeClass = () => {
    if (status === 'RECEIVED' || status === 'ACCEPTED') return 'specimen-badge-RECEIVED';
    if (status === 'INCUBATION' || status === 'PROCESSING') return 'specimen-badge-INCUBATION';
    if (status === 'REJECTED') return 'specimen-badge-REJECTED';
    if (status === 'DELIVERED' || status === 'REPORT_GENERATED') return 'specimen-badge-DELIVERED';
    return 'specimen-badge-REQUESTED';
  };

  return (
    <span className={`lims-status-badge ${getBadgeClass()} ${className}`} role="status">
      <span>●</span>
      <span>{status}</span>
    </span>
  );
};
