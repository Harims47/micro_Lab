import React, { useState, useRef, useCallback } from 'react';
import type {
  DialogOptions,
  DeleteConfirmOptions,
  UnsavedChangesOptions,
  SessionExpiredOptions,
} from './types';
import { Button } from '../../components/Foundation/Button';
import { Modal } from '../../components/Overlay/Modal';
import { DialogContext, type DialogContextType } from './DialogContext';

type DialogType = 'confirm' | 'delete' | 'unsaved' | 'session-expired' | null;

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogType, setDialogType] = useState<DialogType>(null);

  // Store options in state to trigger re-renders
  const [confirmOpts, setConfirmOpts] = useState<DialogOptions | null>(null);
  const [deleteOpts, setDeleteOpts] = useState<DeleteConfirmOptions | null>(null);
  const [unsavedOpts, setUnsavedOpts] = useState<UnsavedChangesOptions | null>(null);
  const [sessionOpts, setSessionOpts] = useState<SessionExpiredOptions | null>(null);

  // Store resolver function
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const sessionResolverRef = useRef<(() => void) | null>(null);

  // ─── Dialog Hooks / Methods ────────────────────────────────────────────────

  const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
    setConfirmOpts(options);
    setDialogType('confirm');
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const confirmDelete = useCallback((options: DeleteConfirmOptions): Promise<boolean> => {
    setDeleteOpts(options);
    setDialogType('delete');
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const confirmUnsavedChanges = useCallback((options?: UnsavedChangesOptions): Promise<boolean> => {
    setUnsavedOpts(options ?? {});
    setDialogType('unsaved');
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const showSessionExpired = useCallback((options?: SessionExpiredOptions): Promise<void> => {
    setSessionOpts(options ?? {});
    setDialogType('session-expired');
    return new Promise<void>((resolve) => {
      sessionResolverRef.current = resolve;
    });
  }, []);

  // ─── Handle Resolving ──────────────────────────────────────────────────────

  const handleResolve = (result: boolean) => {
    setDialogType(null);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  const handleSessionResolve = () => {
    setDialogType(null);
    if (sessionResolverRef.current) {
      sessionResolverRef.current();
      sessionResolverRef.current = null;
    }
  };

  const getSeverityColor = (severity?: 'info' | 'warning' | 'danger') => {
    if (severity === 'danger') return 'var(--color-brand-danger, #ef4444)';
    if (severity === 'warning') return 'var(--color-brand-warning, #f59e0b)';
    return 'var(--color-brand-primary, #6366f1)';
  };

  const contextValue = React.useMemo<DialogContextType>(
    () => ({
      confirm,
      confirmDelete,
      confirmUnsavedChanges,
      showSessionExpired,
    }),
    [confirm, confirmDelete, confirmUnsavedChanges, showSessionExpired]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}

      {/* ─── 1. General Confirmation Dialog ─── */}
      <Modal
        isOpen={dialogType === 'confirm'}
        onClose={() => handleResolve(false)}
        title={confirmOpts?.title ?? 'Confirm Action'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-sans, system-ui)' }}>
          <p style={{ margin: 0, color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.5 }}>
            {confirmOpts?.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button variant="outline" onClick={() => handleResolve(false)}>
              {confirmOpts?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant="solid"
              style={{ backgroundColor: getSeverityColor(confirmOpts?.severity) }}
              onClick={() => handleResolve(true)}
            >
              {confirmOpts?.confirmLabel ?? 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── 2. Delete Confirmation Dialog ─── */}
      <Modal
        isOpen={dialogType === 'delete'}
        onClose={() => handleResolve(false)}
        title={deleteOpts?.title ?? 'Delete Confirmation'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-sans, system-ui)' }}>
          <p style={{ margin: 0, color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.5 }}>
            {deleteOpts?.message ?? `Are you sure you want to permanently delete this ${deleteOpts?.entityName ?? 'item'}? This action cannot be undone.`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button variant="outline" onClick={() => handleResolve(false)}>
              {deleteOpts?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant="solid"
              style={{ backgroundColor: 'var(--color-brand-danger, #ef4444)' }}
              onClick={() => handleResolve(true)}
            >
              {deleteOpts?.confirmLabel ?? 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── 3. Unsaved Changes Dialog ─── */}
      <Modal
        isOpen={dialogType === 'unsaved'}
        onClose={() => handleResolve(false)}
        title={unsavedOpts?.title ?? 'Unsaved Changes'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-sans, system-ui)' }}>
          <p style={{ margin: 0, color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.5 }}>
            {unsavedOpts?.message ?? 'You have unsaved changes. If you leave this page, your changes will be discarded.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button variant="outline" onClick={() => handleResolve(false)}>
              {unsavedOpts?.keepEditingLabel ?? 'Keep Editing'}
            </Button>
            <Button
              variant="solid"
              style={{ backgroundColor: 'var(--color-brand-danger, #ef4444)' }}
              onClick={() => handleResolve(true)}
            >
              {unsavedOpts?.discardLabel ?? 'Discard Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── 4. Session Expired Dialog ─── */}
      <Modal
        isOpen={dialogType === 'session-expired'}
        onClose={() => {}} // Disallow closing by clicking backdrop
        title={sessionOpts?.title ?? 'Session Expired'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-sans, system-ui)' }}>
          <p style={{ margin: 0, color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.5 }}>
            {sessionOpts?.message ?? 'Your secure laboratory session has expired due to inactivity. Please log in again to continue.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button
              variant="solid"
              onClick={handleSessionResolve}
              style={{ width: '100%' }}
            >
              {sessionOpts?.loginLabel ?? 'Go to Login'}
            </Button>
          </div>
        </div>
      </Modal>
    </DialogContext.Provider>
  );
};

