export const LogSeverity = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
} as const;
export type LogSeverity = typeof LogSeverity[keyof typeof LogSeverity];

export const LogCategory = {
  APP: 'APP',
  HTTP: 'HTTP',
  AUTH: 'AUTH',
  PERMISSION: 'PERMISSION',
  NAVIGATION: 'NAVIGATION',
  SYSTEM: 'SYSTEM',
  UI: 'UI',
} as const;
export type LogCategory = typeof LogCategory[keyof typeof LogCategory];

export interface LogEntry {
  timestamp: string;           // ISO 8601
  correlationId: string;       // session-level UUID
  userId: string | null;
  module: string;              // e.g. 'SpecimenModule', 'HttpClient'
  screen: string | null;       // e.g. 'SpecimenList', null if not on a page
  severity: LogSeverity;
  category: LogCategory;
  message: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
