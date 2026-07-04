import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../infrastructure/auth';
import { Button } from '../components/Foundation/Button';
import { TextInput } from '../components/Form/TextInput';

export const ResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'mock-verification-token-2026';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long and include numbers or symbols.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify entries.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate('/password-updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update passcode credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>🔒</div>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>Enter secure LIMS account passcode</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorAlert}>
              <span>⚠️</span>
              <span style={{ font: 'var(--type-body-small)', color: 'var(--color-status-danger)', fontWeight: 500 }}>
                {error}
              </span>
            </div>
          )}

          <TextInput
            type="password"
            label="New Passcode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            disabled={loading}
            required
          />

          <TextInput
            type="password"
            label="Confirm Passcode"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new passcode"
            disabled={loading}
            required
          />

          <Button
            variant="solid"
            onClick={() => {}}
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
          >
            {loading ? 'Updating Credentials...' : 'Save New Password'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xs)' }}>
            <Link to="/login" style={{ font: 'var(--type-body-small)', color: 'var(--color-brand-primary)', textDecoration: 'none' }}>
              Cancel and return to Sign In
            </Link>
          </div>
        </form>
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
};
