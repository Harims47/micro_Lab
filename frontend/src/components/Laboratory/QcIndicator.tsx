import React from 'react';
import './Laboratory.css';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface QcIndicatorProps {
  strainName: string;
  passed: boolean;
  qcDate: string;
  className?: string;
}

export const QcIndicator: React.FC<QcIndicatorProps> = ({
  strainName,
  passed,
  qcDate,
  className = ''
}) => {
  return (
    <div className={`lims-qc-indicator ${passed ? 'lims-qc-passed' : 'lims-qc-failed'} ${className}`} role="status">
      {passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.85rem' }}>QC Control: <strong>{strainName}</strong></span>
        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Read Date: {qcDate} - {passed ? 'VALIDATED CONTROL' : 'CONTROL FAILED'}</span>
      </div>
    </div>
  );
};
