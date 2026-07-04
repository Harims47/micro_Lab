import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '../Foundation/Button';
import { useAuth } from '../../infrastructure/auth/useAuth';
import { appConfig } from '../../infrastructure/config/appConfig';

interface SessionExpiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionExpiredDialog: React.FC<SessionExpiredDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { extendSession, logout } = useAuth();
  
  // Starting countdown from warning duration (e.g. 5 minutes = 300 seconds)
  const initialSeconds = Math.round(appConfig.session.warningMs / 1000);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(initialSeconds);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, logout, initialSeconds]);

  const handleExtend = async () => {
    setLoading(true);
    try {
      await extendSession();
      onClose();
    } catch {
      // AuthProvider handles failure by shifting state to EXPIRED & logging out
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      onClose();
    } catch {
      // Force close
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const footerActions = (
    <>
      <Button variant="outline" onClick={handleLogout} disabled={loading}>
        Sign Out
      </Button>
      <Button variant="solid" onClick={handleExtend} disabled={loading}>
        {loading ? 'Extending...' : 'Extend Session'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Block closing by clicking backdrop or ESC to enforce security
      title="Inactivity Session Warning"
      footerActions={footerActions}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-xs) 0' }}>
        <div style={{ fontSize: '2.5rem' }}>⏳</div>
        <h3 style={{ font: 'var(--type-heading-item)', color: 'var(--color-status-warning)', margin: 0 }}>
          Your session is about to expire
        </h3>
        <p style={{ font: 'var(--type-body-default)', color: 'var(--color-text-secondary)', textAlign: 'center', margin: 0 }}>
          For CAP & HIPAA security compliance, your inactive session will automatically close in:
        </p>
        <div style={{ font: 'var(--type-heading-section)', fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-status-danger)', padding: '8px 24px', backgroundColor: 'var(--color-surface-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-default)' }}>
          {formatTime(secondsLeft)}
        </div>
      </div>
    </Modal>
  );
};
