import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../infrastructure/auth/useAuth';
import { useIdentity } from '../infrastructure/auth/useIdentity';
import { TextInput } from '../components/Form/TextInput';
import { Checkbox } from '../components/Form/Checkbox';
import { Button } from '../components/Foundation/Button';
import { Modal } from '../components/Overlay/Modal';
import { useNotification } from '../infrastructure/notifications/useNotification';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { user } = useIdentity();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [username, setUsername] = useState('tech_user');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MFA OTP Simulation State
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<{ u: string; p: string; r: boolean } | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Username and security passcode are required.');
      return;
    }

    setLoading(true);
    try {
      // For standard simulation, we trigger the MFA Modal before completing credentials check
      // except if the username triggers a direct error scenario (disabled, locked, error)
      if (username === 'server_error' || username === 'disabled_user' || username === 'locked_user' || username === 'expired_password_user') {
        // Direct trigger to verify error banners
        await login(username, password, rememberMe);
      } else {
        // Standard user: prompt MFA simulation first
        setPendingCredentials({ u: username, p: password, r: rememberMe });
        setShowMfaModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    setMfaError(null);
    if (mfaCode !== '123456') {
      setMfaError('Invalid MFA verification code. Use standard test code: 123456');
      return;
    }

    if (!pendingCredentials) return;

    setLoading(true);
    try {
      await login(pendingCredentials.u, pendingCredentials.p, pendingCredentials.r);
      addToast('success', 'MFA verified. Session established.', 'Security Context');
      setShowMfaModal(false);
      navigate('/');
    } catch (err: any) {
      setMfaError(err.message || 'Verification failed.');
      setShowMfaModal(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>☣</div>
          <h1 style={styles.title}>Microbiology LIMS</h1>
          <p style={styles.subtitle}>Enterprise Laboratory Portal</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorMessage}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>

          <TextInput
            label="Username / ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter laboratory username"
            disabled={loading}
            required
          />

          <TextInput
            type="password"
            label="Security Passcode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter security passcode"
            disabled={loading}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Checkbox
              label="Remember Me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Link
              to="/forgot-password"
              style={{ font: 'var(--type-body-small)', color: 'var(--color-brand-primary)', textDecoration: 'none', marginBottom: '16px' }}
            >
              Forgot Passcode?
            </Link>
          </div>

          <Button
            variant="solid"
            onClick={() => {}}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Authorizing Session...' : 'Authorize Login Session'}
          </Button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Secure clinical access subject to CAP & HIPAA compliance auditing.</p>
        </div>
      </div>

      {/* MFA Verification Modal */}
      <Modal
        isOpen={showMfaModal}
        onClose={() => setShowMfaModal(false)}
        title="Multi-Factor Authentication"
        footerActions={
          <>
            <Button variant="outline" onClick={() => setShowMfaModal(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={handleVerifyMfa}>
              Verify & Sign In
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {mfaError && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorMessage}>{mfaError}</span>
            </div>
          )}
          <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Enter the 6-digit verification code dispatched to your registered clinical device.
          </p>
          <TextInput
            label="One-Time Passcode (OTP)"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="Enter 123456 to verify"
            required
          />
          <small style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
            Note: For testing, input the standard bypass verification code: <strong>123456</strong>.
          </small>
        </div>
      </Modal>
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
    padding: 'var(--spacing-md)'
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--elevation-3)',
    padding: 'var(--spacing-xl)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)'
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-xs)'
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
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: 'var(--spacing-xs)'
  },
  title: {
    font: 'var(--type-heading-section)',
    color: 'var(--color-text-primary)'
  },
  subtitle: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2xs)'
  },
  label: {
    font: 'var(--type-label-default)',
    color: 'var(--color-text-primary)'
  },
  select: {
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-raised)',
    color: 'var(--color-text-primary)',
    font: 'var(--type-body-default)',
    width: '100%',
    cursor: 'pointer'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    backgroundColor: 'var(--color-status-danger-bg)',
    border: '1px solid var(--color-status-danger)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-sm)'
  },
  errorIcon: {
    fontSize: '1.2rem',
    color: 'var(--color-status-danger)'
  },
  errorMessage: {
    font: 'var(--type-body-small)',
    color: 'var(--color-status-danger)',
    fontWeight: 500
  },
  footer: {
    textAlign: 'center',
    marginTop: 'var(--spacing-sm)'
  },
  footerText: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem'
  }
};
