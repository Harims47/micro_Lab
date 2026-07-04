import React from 'react';
import './Data.css';
import { Button } from '../Foundation';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = '🔍',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`lims-empty-state ${className}`}>
      <span className="lims-empty-state-icon" aria-hidden="true">{icon}</span>
      <h3 style={{ font: 'var(--type-heading-subsection)', color: 'var(--color-text-primary)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ font: 'var(--type-body-default)', color: 'var(--color-text-secondary)', maxWidth: '360px', marginBottom: 'var(--spacing-md)' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};
