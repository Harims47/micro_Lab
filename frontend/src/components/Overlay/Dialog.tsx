import React from 'react';
import './Overlay.css';
import { Modal } from './Modal';
import { Button } from '../Foundation';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  type?: 'info' | 'warning' | 'danger';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  type = 'info'
}) => {
  const getConfirmButtonColor = () => {
    if (type === 'danger') return 'var(--color-status-danger)';
    if (type === 'warning') return 'var(--color-status-warning)';
    return 'var(--color-brand-primary)';
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose}>{cancelLabel}</Button>
      <Button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        style={{ backgroundColor: getConfirmButtonColor(), color: 'white' }}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footerActions={footer}>
      <p style={{ font: 'var(--type-body-default)', margin: 0 }}>{message}</p>
    </Modal>
  );
};
