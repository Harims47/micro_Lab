import React from 'react';
import './Foundation.css';

export interface BadgeProps {
  count: number | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ count, className = '' }) => {
  return <span className={`lims-badge ${className}`}>{count}</span>;
};
