import React from 'react';
import './Overlay.css';
import { SmallText } from '../Foundation';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
  className = ''
}) => {
  return (
    <div className={`lims-notif-center ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--spacing-xs)', borderBottom: '1px solid var(--color-border-default)' }}>
        <span style={{ font: 'var(--type-label-default)', color: 'var(--color-text-primary)' }}>System Notifications</span>
        {onClearAll && notifications.length > 0 && (
          <button
            onClick={onClearAll}
            style={{ border: 'none', background: 'transparent', color: 'var(--color-brand-primary)', font: 'var(--type-body-small)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', font: 'var(--type-body-default)' }}>
          No new alerts.
        </div>
      ) : (
        notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => !item.read && onMarkAsRead(item.id)}
            className={`lims-notif-item ${!item.read ? 'lims-notif-unread' : ''}`}
            style={{ cursor: !item.read ? 'pointer' : 'default' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ font: 'var(--type-body-small)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.title}</strong>
              <SmallText style={{ fontSize: '0.65rem' }}>{item.time}</SmallText>
            </div>
            <p style={{ font: 'var(--type-body-small)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              {item.message}
            </p>
          </div>
        ))
      )}
    </div>
  );
};
