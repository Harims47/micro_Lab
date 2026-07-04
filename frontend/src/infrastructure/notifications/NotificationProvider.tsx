import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { ToastType, ToastMessage, NotificationCenterItem } from './types';
import { AlertService } from './AlertService';
import { TOAST_DEFAULT_DURATION_MS, TOAST_ERROR_DURATION_MS } from '../config/constants';
import { NotificationContext, type NotificationContextType } from './NotificationContext';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationCenterItem[]>([]);

  // ─── Toasts Handlers ────────────────────────────────────────────────────────

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const resolvedDuration = duration ?? (type === 'error' ? TOAST_ERROR_DURATION_MS : TOAST_DEFAULT_DURATION_MS);

      const newToast: ToastMessage = {
        id,
        type,
        message,
        title,
        duration: resolvedDuration,
        timestamp: new Date().toISOString(),
      };

      setToasts((prev) => [...prev, newToast]);

      if (resolvedDuration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, resolvedDuration);
      }
    },
    [dismissToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // ─── Alert Service Binding ──────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = AlertService.subscribe((type, message, title, duration) => {
      addToast(type, message, title, duration);
    });
    return unsubscribe;
  }, [addToast]);

  // ─── Notification Center Handlers ───────────────────────────────────────────

  const addNotification = useCallback(
    (type: ToastType, title: string, message: string, actionUrl?: string) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newItem: NotificationCenterItem = {
        id,
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl,
      };
      setNotifications((prev) => [newItem, ...prev]);
    },
    []
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue = React.useMemo<NotificationContextType>(
    () => ({
      toasts,
      notifications,
      addToast,
      dismissToast,
      clearAllToasts,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
    }),
    [
      toasts,
      notifications,
      addToast,
      dismissToast,
      clearAllToasts,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastPortal toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
};

// ─── Self-Contained Toast Portal Renderer ────────────────────────────────────

interface ToastPortalProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastPortal: React.FC<ToastPortalProps> = ({ toasts, onDismiss }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'error':
        return '🔴';
      case 'info':
      default:
        return '🔵';
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'var(--color-brand-success, #10b981)';
      case 'warning':
        return 'var(--color-brand-warning, #f59e0b)';
      case 'error':
        return 'var(--color-brand-danger, #ef4444)';
      case 'info':
      default:
        return 'var(--color-brand-primary, #6366f1)';
    }
  };

  const portalContent = (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '420px',
        width: 'calc(100% - 48px)',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--color-surface-overlay, #1e293b)',
            color: 'var(--color-text-primary, #f8fafc)',
            borderRadius: '8px',
            borderLeft: `4px solid ${getBorderColor(t.type)}`,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
            fontFamily: 'var(--font-sans, system-ui)',
            fontSize: '0.9rem',
            animation: 'slideIn 0.2s ease-out',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{getIcon(t.type)}</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {t.title && (
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.title}</div>
            )}
            <div style={{ color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.4 }}>
              {t.message}
            </div>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary, #94a3b8)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: 0,
              lineHeight: 1,
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  return ReactDOM.createPortal(portalContent, document.body);
};
