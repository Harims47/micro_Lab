import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../infrastructure/auth';
import { Button } from '../components/Foundation/Button';
import { TextInput } from '../components/Form/TextInput';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid laboratory email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch recovery link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>🔑</div>
          <h1 style={styles.title}>Account Recovery</h1>
          <p style={styles.subtitle}>Microbiology LIMS Identity Verification</p>
        </div>

        {success ? (
          <div style={styles.successBlock}>
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-xs)' }}>✉️</div>
            <h3 style={{ font: 'var(--type-heading-item)', color: 'var(--color-text-primary)', margin: 0 }}>
              Check your Inbox
            </h3>
            <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center' }}>
              We have dispatched recovery instructions to <strong>{email}</strong>.
            </p>
            <Link to="/login" style={styles.backLink}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorAlert}>
                <span>⚠️</span>
                <span style={{ font: 'var(--type-body-small)', color: 'var(--color-status-danger)', fontWeight: 500 }}>
                  {error}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xs)' }}>
              <TextInput
                label="Registered Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. s.connor@microlab.org"
                disabled={loading}
              />
              <small style={styles.helperText}>
                Enter your authorized clinical email address to receive password reset tokens.
              </small>
            </div>

            <Button
              variant="solid"
              onClick={() => {}}
              disabled={loading}
              style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
            >
              {loading ? 'Dispatching Verification...' : 'Send Recovery Link'}
            </Button>

            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xs)' }}>
              <Link to="/login" style={{ font: 'var(--type-body-small)', color: 'var(--color-brand-primary)', textDecoration: 'none' }}>
                Cancel and return to Sign In
              </Link>
            </div>
          </form>
        )}
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
    maxWidth: '420px',
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
    backgroundColor: 'var(--color-brand-secondary-bg)',
    color: 'var(--color-brand-primary)',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    backgroundColor: 'var(--color-status-danger-bg)',
    border: '1px solid var(--color-status-danger)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-sm)',
  },
  helperText: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
    marginTop: '2px',
  },
  successBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-sm) 0',
  },
  backLink: {
    marginTop: 'var(--spacing-md)',
    font: 'var(--type-label-default)',
    color: 'var(--color-brand-primary)',
    textDecoration: 'none',
    border: '1px solid var(--color-border-default)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-base)',
  },
};
