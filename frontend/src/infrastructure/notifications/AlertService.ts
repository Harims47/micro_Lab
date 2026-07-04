import type { ToastType } from './types';

type AlertListener = (type: ToastType, message: string, title?: string, duration?: number) => void;

const listeners = new Set<AlertListener>();

export const AlertService = {
  /**
   * Subscribes a listener (typically NotificationProvider) to receive alerts.
   */
  subscribe(listener: AlertListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  success(message: string, title?: string, duration?: number) {
    listeners.forEach((l) => l('success', message, title, duration));
  },

  info(message: string, title?: string, duration?: number) {
    listeners.forEach((l) => l('info', message, title, duration));
  },

  warn(message: string, title?: string, duration?: number) {
    listeners.forEach((l) => l('warning', message, title, duration));
  },

  error(message: string, title?: string, duration?: number) {
    listeners.forEach((l) => l('error', message, title, duration));
  },
};
