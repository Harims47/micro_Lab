import { createContext } from 'react';
import type { ToastType, ToastMessage, NotificationCenterItem } from './types';

export interface NotificationContextType {
  toasts: ToastMessage[];
  notifications: NotificationCenterItem[];
  addToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  addNotification: (type: ToastType, title: string, message: string, actionUrl?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
