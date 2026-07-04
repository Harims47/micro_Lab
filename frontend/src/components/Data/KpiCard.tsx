import React from 'react';
import './Data.css';

export interface KpiCardProps {
  title: string;
  value: string | number;
  indicatorColor?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  indicatorColor = 'var(--color-brand-primary)',
  trend,
  className = ''
}) => {
  return (
    <div className={`lims-kpi-card ${className}`} role="status">
      <div className="lims-kpi-indicator" style={{ backgroundColor: indicatorColor }} />
      <span className="lims-kpi-title">{title}</span>
      <span className="lims-kpi-value">{value}</span>
      {trend && (
        <span className={`lims-kpi-trend ${trend.direction === 'up' ? 'trend-up' : 'trend-down'}`}>
          {trend.direction === 'up' ? '▲' : '▼'} {trend.value}
        </span>
      )}
    </div>
  );
};
