import React from 'react';
import './Overlay.css';
import { X, CheckCircle, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

export interface ToastProps {
  items: ToastItem[];
  onDismiss: (id: string) => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  items,
  onDismiss,
  className = ''
}) => {
  return (
    <div className={`lims-toast-panel ${className}`}>
      {items.map((item) => {
        const getBorderColor = () => {
          if (item.type === 'success') return 'var(--color-status-success)';
          if (item.type === 'warning') return 'var(--color-status-warning)';
          if (item.type === 'error') return 'var(--color-status-danger)';
          return 'var(--color-status-info)';
        };

        return (
          <div
            key={item.id}
            className="lims-toast-card"
            style={{ borderLeftColor: getBorderColor() }}
            role="status"
            aria-live="polite"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {item.type === 'success' && <CheckCircle size={18} style={{ color: 'var(--color-status-success)' }} />}
              {item.type === 'warning' && <AlertTriangle size={18} style={{ color: 'var(--color-status-warning)' }} />}
              {item.type === 'error' && <ShieldAlert size={18} style={{ color: 'var(--color-status-danger)' }} />}
              {item.type === 'info' && <Info size={18} style={{ color: 'var(--color-status-info)' }} />}
            </div>
            
            <span style={{ font: 'var(--type-body-small)', fontWeight: 500, color: 'var(--color-text-primary)', flexGrow: 1 }}>
              {item.message}
            </span>

            <button
              onClick={() => onDismiss(item.id)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
