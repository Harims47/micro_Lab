import React from 'react';
import { Card } from './Card';
import { SkeletonLoader } from '../Data/SkeletonLoader';
import { EmptyState } from '../Data/EmptyState';
import { Button } from '../Foundation/Button';
import './Layout.css';

export interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  elevation?: 0 | 1 | 2 | 3;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  loading = false,
  error = null,
  empty = false,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There is no data matching the current criteria in our directory.',
  onRetry,
  elevation = 1,
  className = '',
  style,
  ...props
}) => {
  return (
    <Card
      elevation={elevation}
      className={`lims-content-card ${className}`}
      style={{
        padding: 'var(--spacing-md)',
        overflow: 'hidden',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <div style={styles.stateWrapper}>
          <SkeletonLoader count={5} height="24px" className="lims-table-skeleton" />
        </div>
      ) : error ? (
        <div style={styles.stateWrapper}>
          <span style={styles.errorIcon}>⚠️</span>
          <h3 style={styles.errorTitle}>LIMS Request Interrupted</h3>
          <p style={styles.errorDesc}>{error}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} style={{ marginTop: '12px' }}>
              Retry Query
            </Button>
          )}
        </div>
      ) : empty ? (
        <div style={styles.stateWrapper}>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        children
      )}
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  stateWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 'var(--spacing-xl)',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  errorIcon: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  errorTitle: {
    font: 'var(--type-heading-subsection)',
    color: 'var(--color-status-danger)',
    margin: '0 0 8px 0',
  },
  errorDesc: {
    font: 'var(--type-body-default)',
    color: 'var(--color-text-secondary)',
    margin: 0,
    maxWidth: '420px',
  },
};
export default ContentCard;
