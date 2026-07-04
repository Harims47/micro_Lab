import React, { useState } from 'react';
import { Modal } from './Modal';
import { TextInput } from '../Form/TextInput';
import { Button } from '../Foundation/Button';
import { useAuth } from '../../infrastructure/auth/useAuth';
import { useNotification } from '../../infrastructure/notifications/useNotification';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { changePassword } = useAuth();
  const { addToast } = useNotification();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oldPassword) {
      setError('Please enter your current passcode.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New passcode must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Confirm passcode entries do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      addToast('success', 'Passcode updated successfully.', 'Security');
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const footerActions = (
    <>
      <Button variant="outline" onClick={handleClose} disabled={loading}>
        Cancel
      </Button>
      <Button variant="solid" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Update Passcode'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Security Passcode"
      footerActions={footerActions}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              backgroundColor: 'var(--color-status-danger-bg)',
              border: '1px solid var(--color-status-danger)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            <span>⚠️</span>
            <span style={{ font: 'var(--type-body-small)', color: 'var(--color-status-danger)', fontWeight: 500 }}>
              {error}
            </span>
          </div>
        )}

        <TextInput
          type="password"
          label="Current Passcode"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter current password"
          disabled={loading}
          required
        />

        <TextInput
          type="password"
          label="New Passcode"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min. 8 characters"
          disabled={loading}
          required
        />

        <TextInput
          type="password"
          label="Confirm New Passcode"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-type new password"
          disabled={loading}
          required
        />
      </form>
    </Modal>
  );
};
