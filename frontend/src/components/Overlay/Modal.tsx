import React, { useEffect } from 'react';
import './Overlay.css';
import { X } from 'lucide-react';


export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
  className = ''
}) => {
  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lims-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title-id">
      <div className={`lims-modal ${className}`} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)' }}>
          <h3 id="modal-title-id" style={{ font: 'var(--type-heading-subsection)', color: 'var(--color-text-primary)', margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        
        <div style={{ font: 'var(--type-body-default)', color: 'var(--color-text-primary)', padding: 'var(--spacing-xs) 0' }}>
          {children}
        </div>

        {footerActions && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border-default)', paddingTop: 'var(--spacing-sm)' }}>
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};
