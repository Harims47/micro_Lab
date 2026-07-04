export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number; // ms
  timestamp: string;
  dismissed?: boolean;
}

export interface NotificationCenterItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
