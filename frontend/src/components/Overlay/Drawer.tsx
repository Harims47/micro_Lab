import React, { useEffect } from 'react';
import './Overlay.css';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
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
    <div className="lims-backdrop" onClick={onClose}>
      <div className={`lims-drawer ${className}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)' }}>
          <h3 style={{ font: 'var(--type-heading-subsection)', color: 'var(--color-text-primary)', margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>
        
        <div style={{ flexGrow: 1, overflowY: 'auto', font: 'var(--type-body-default)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
