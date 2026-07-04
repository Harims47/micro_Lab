import React from 'react';
import type { AppError } from './types';
import { AppErrorCode, ErrorSeverity } from './types';
import { mapUnknown } from './errorMap';

import { logger } from '../logger/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  appError: AppError | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, appError: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const appError = mapUnknown(error, {
      code: AppErrorCode.RENDER_ERROR,
      severity: ErrorSeverity.CRITICAL,
      recoverable: true,
    });
    return { hasError: true, appError };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = this.state.appError ?? mapUnknown(error);
    console.error('[ErrorBoundary] Caught render error:', appError, errorInfo);
    
    // Integrate directly with the logger framework
    logger.error(`Render error in Component Tree: ${appError.message}`, {
      code: appError.code,
      severity: appError.severity,
      componentStack: errorInfo.componentStack,
    });
    
    this.props.onError?.(appError, errorInfo);
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys ?? [];
      const nextKeys = this.props.resetKeys ?? [];
      const changed = prevKeys.some((k, i) => k !== nextKeys[i]);
      if (changed) {
        this.setState({ hasError: false, appError: null });
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, appError: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.appError}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

// ─── Default Fallback UI ─────────────────────────────────────────────────────

interface ErrorFallbackProps {
  error: AppError | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => (
  <div
    role="alert"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--color-surface-base, #0f172a)',
      color: 'var(--color-text-primary, #f1f5f9)',
      fontFamily: 'var(--font-sans, system-ui)',
      gap: '1.5rem',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '3rem' }}>⚠️</div>
    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
      Something went wrong
    </h1>
    <p style={{ color: 'var(--color-text-secondary, #94a3b8)', maxWidth: '480px', margin: 0 }}>
      {error?.userMessage ?? 'An unexpected error occurred. Please try reloading the page.'}
    </p>
    {error?.recoverable && (
      <button
        onClick={onReset}
        style={{
          padding: '10px 24px',
          backgroundColor: 'var(--color-brand-primary, #6366f1)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Try Again
      </button>
    )}
    {error && (
      <details style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #94a3b8)', maxWidth: '600px' }}>
        <summary style={{ cursor: 'pointer' }}>Error Details</summary>
        <pre style={{ textAlign: 'left', marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {`Code: ${error.code}\nSeverity: ${error.severity}\nTimestamp: ${error.timestamp}`}
        </pre>
      </details>
    )}
  </div>
);
