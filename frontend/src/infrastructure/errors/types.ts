// Error type definitions for the LIMS application infrastructure

export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

export const AppErrorCode = {
  // Network / HTTP
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  REQUEST_CANCELLED: 'REQUEST_CANCELLED',

  // HTTP Status mapped
  HTTP_400_BAD_REQUEST: 'HTTP_400_BAD_REQUEST',
  HTTP_401_UNAUTHORIZED: 'HTTP_401_UNAUTHORIZED',
  HTTP_403_FORBIDDEN: 'HTTP_403_FORBIDDEN',
  HTTP_404_NOT_FOUND: 'HTTP_404_NOT_FOUND',
  HTTP_409_CONFLICT: 'HTTP_409_CONFLICT',
  HTTP_422_VALIDATION: 'HTTP_422_VALIDATION',
  HTTP_429_RATE_LIMITED: 'HTTP_429_RATE_LIMITED',
  HTTP_500_SERVER_ERROR: 'HTTP_500_SERVER_ERROR',
  HTTP_503_UNAVAILABLE: 'HTTP_503_UNAVAILABLE',

  // Application
  RENDER_ERROR: 'RENDER_ERROR',
  UNHANDLED_REJECTION: 'UNHANDLED_REJECTION',
  UNKNOWN: 'UNKNOWN',

  // Permissions
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
} as const;
export type AppErrorCode = typeof AppErrorCode[keyof typeof AppErrorCode];

export interface AppError {
  code: AppErrorCode;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  timestamp: string;
  correlationId?: string;
  endpoint?: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
  originalError?: unknown;
}
