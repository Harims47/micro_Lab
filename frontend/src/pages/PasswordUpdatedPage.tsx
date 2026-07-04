import React from 'react';
import { Link } from 'react-router-dom';

export const PasswordUpdatedPage: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>✔️</div>
          <h1 style={styles.title}>Password Updated</h1>
          <p style={styles.subtitle}>Microbiology LIMS Credential Sync</p>
        </div>

        <div style={styles.content}>
          <p style={styles.description}>
            Your security passcode credentials have been successfully updated. Your new session details are active across the LIMS platform.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)' }}>
          <Link to="/login" style={styles.backLink}>
            Proceed to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--color-surface-base)',
    padding: 'var(--spacing-md)',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--elevation-3)',
    padding: 'var(--spacing-xl)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-circular)',
    backgroundColor: 'var(--color-status-success-bg)',
    color: 'var(--color-status-success)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: 'var(--spacing-xs)',
  },
  title: {
    font: 'var(--type-heading-section)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  subtitle: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  description: {
    font: 'var(--type-body-default)',
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    lineHeight: '1.5',
    margin: 0,
  },
  backLink: {
    display: 'inline-block',
    font: 'var(--type-label-default)',
    color: 'var(--color-brand-primary)',
    textDecoration: 'none',
    border: '1px solid var(--color-border-default)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-base)',
    cursor: 'pointer',
  },
};
