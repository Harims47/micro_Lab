import React from 'react';
import { Link } from 'react-router-dom';

export const AccountLockedPage: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>🚫</div>
          <h1 style={styles.title}>Account Locked</h1>
          <p style={styles.subtitle}>Microbiology LIMS Access Denied</p>
        </div>

        <div style={styles.content}>
          <p style={styles.description}>
            Your laboratory account has been locked due to three consecutive failed login passcode attempts. This policy is enforced in compliance with CAP & HIPAA security directives to safeguard clinical data.
          </p>

          <div style={styles.infoBlock}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Required Action:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)' }}>
              Please contact the Laboratory System Administrator or Clinical IT Helpdesk to verify your credentials and request an account unlock key.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={styles.backLink}>
            Return to Sign In
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
    maxWidth: '460px',
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
    backgroundColor: 'var(--color-status-danger-bg)',
    color: 'var(--color-status-danger)',
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
  infoBlock: {
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
    font: 'var(--type-body-small)',
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
    transition: 'background-color var(--motion-duration-fast) var(--motion-ease-standard)',
  },
};
