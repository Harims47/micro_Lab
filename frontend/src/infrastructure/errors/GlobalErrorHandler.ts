import { AppErrorCode, ErrorSeverity } from './types';
import type { AppError } from './types';
import { mapUnknown } from './errorMap';
import { logger } from '../logger/logger';

type ErrorDispatch = (error: AppError) => void;

// Internal dispatch reference — set by NotificationProvider
let _dispatch: ErrorDispatch | null = null;

export const GlobalErrorHandler = {
  /**
   * Called by AppInfrastructureProvider to wire the notification dispatch.
   * Must be called before the app renders.
   */
  setDispatch(dispatch: ErrorDispatch) {
    _dispatch = dispatch;
  },

  /**
   * Programmatic error reporting — call from anywhere in the app.
   */
  report(error: AppError) {
    console.error(`[GlobalErrorHandler] ${error.code}:`, error.message, error.metadata ?? '');
    // Integrate directly with the logger framework
    logger.error(error.message, {
      code: error.code,
      severity: error.severity,
      metadata: error.metadata,
    });
    _dispatch?.(error);
  },

  /**
   * Installs window-level handlers for uncaught errors and promise rejections.
   * Call once at app startup.
   */
  install() {
    window.onerror = (message, source, lineno, colno, error) => {
      const appError = mapUnknown(error ?? new Error(String(message)), {
        code: AppErrorCode.UNKNOWN,
        severity: ErrorSeverity.HIGH,
        metadata: { source, lineno, colno },
      });
      GlobalErrorHandler.report(appError);
      return false; // Let browser also log it
    };

    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      const appError = mapUnknown(event.reason, {
        code: AppErrorCode.UNHANDLED_REJECTION,
        severity: ErrorSeverity.HIGH,
      });
      GlobalErrorHandler.report(appError);
    };

    console.info('[GlobalErrorHandler] Installed window error handlers');
  },

  /**
   * Removes window-level handlers. Used in testing.
   */
  uninstall() {
    window.onerror = null;
    window.onunhandledrejection = null;
  },
};
