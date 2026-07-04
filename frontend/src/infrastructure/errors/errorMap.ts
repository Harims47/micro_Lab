import type { AppError } from './types';
import { AppErrorCode, ErrorSeverity } from './types';

const now = () => new Date().toISOString();

// Maps HTTP status codes to AppError
export function mapHttpError(
  status: number,
  body?: unknown,
  endpoint?: string,
  correlationId?: string
): AppError {
  const meta = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};

  switch (status) {
    case 400:
      return {
        code: AppErrorCode.HTTP_400_BAD_REQUEST,
        message: 'Bad request',
        userMessage: 'The request could not be processed. Please check your input.',
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    case 401:
      return {
        code: AppErrorCode.HTTP_401_UNAUTHORIZED,
        message: 'Unauthorized',
        userMessage: 'Your session has expired. Please log in again.',
        severity: ErrorSeverity.HIGH,
        recoverable: true,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    case 403:
      return {
        code: AppErrorCode.HTTP_403_FORBIDDEN,
        message: 'Forbidden',
        userMessage: 'You do not have permission to perform this action.',
        severity: ErrorSeverity.MEDIUM,
        recoverable: false,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    case 404:
      return {
        code: AppErrorCode.HTTP_404_NOT_FOUND,
        message: 'Not found',
        userMessage: 'The requested resource was not found.',
        severity: ErrorSeverity.LOW,
        recoverable: false,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    case 409:
      return {
        code: AppErrorCode.HTTP_409_CONFLICT,
        message: 'Conflict',
        userMessage: 'This action conflicts with another operation. Please refresh and try again.',
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    case 422:
      return {
        code: AppErrorCode.HTTP_422_VALIDATION,
        message: 'Validation failed',
        userMessage: 'The submitted data failed validation. Please review and correct the highlighted fields.',
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    case 429:
      return {
        code: AppErrorCode.HTTP_429_RATE_LIMITED,
        message: 'Rate limited',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        severity: ErrorSeverity.LOW,
        recoverable: true,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    case 500:
      return {
        code: AppErrorCode.HTTP_500_SERVER_ERROR,
        message: 'Internal server error',
        userMessage: 'A server error occurred. Our team has been notified. Please try again shortly.',
        severity: ErrorSeverity.HIGH,
        recoverable: true,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    case 503:
      return {
        code: AppErrorCode.HTTP_503_UNAVAILABLE,
        message: 'Service unavailable',
        userMessage: 'The service is temporarily unavailable. Please try again in a few minutes.',
        severity: ErrorSeverity.HIGH,
        recoverable: true,
        timestamp: now(),
        statusCode: status,
        endpoint,
        correlationId,
        metadata: meta,
      };
    default:
      return mapUnknown(
        new Error(`HTTP ${status}`),
        { endpoint, statusCode: status, correlationId }
      );
  }
}

// Maps unknown/unhandled errors to AppError
export function mapUnknown(
  err: unknown,
  extra?: Partial<AppError>
): AppError {
  if (err instanceof Error) {
    const isNetwork = err.message.toLowerCase().includes('network') ||
      err.message.toLowerCase().includes('fetch');
    const isTimeout = err.name === 'AbortError' ||
      err.message.toLowerCase().includes('timeout');

    if (isTimeout) {
      return {
        code: AppErrorCode.REQUEST_TIMEOUT,
        message: err.message,
        userMessage: 'The request timed out. Please check your connection and try again.',
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
        timestamp: now(),
        originalError: err,
        ...extra,
      };
    }

    if (isNetwork) {
      return {
        code: AppErrorCode.NETWORK_UNAVAILABLE,
        message: err.message,
        userMessage: 'Unable to connect to the server. Please check your network connection.',
        severity: ErrorSeverity.HIGH,
        recoverable: true,
        timestamp: now(),
        originalError: err,
        ...extra,
      };
    }

    return {
      code: AppErrorCode.UNKNOWN,
      message: err.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      timestamp: now(),
      originalError: err,
      ...extra,
    };
  }

  return {
    code: AppErrorCode.UNKNOWN,
    message: String(err),
    userMessage: 'An unexpected error occurred.',
    severity: ErrorSeverity.MEDIUM,
    recoverable: true,
    timestamp: now(),
    originalError: err,
    ...extra,
  };
}

// Maps permission-denied scenarios
export function mapPermissionError(action?: string): AppError {
  return {
    code: AppErrorCode.PERMISSION_DENIED,
    message: `Permission denied${action ? `: ${action}` : ''}`,
    userMessage: 'You do not have permission to perform this action.',
    severity: ErrorSeverity.MEDIUM,
    recoverable: false,
    timestamp: now(),
  };
}
