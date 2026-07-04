import { LogSeverity, LogCategory } from './types';
import type { LogEntry } from './types';
import { getCorrelationId } from './correlationId';
import { buildConfig } from '../config/buildConfig';

// ─── In-Memory Buffer ────────────────────────────────────────────────────────
const BUFFER_MAX = 500;
const buffer: LogEntry[] = [];

function pushToBuffer(entry: LogEntry) {
  if (buffer.length >= BUFFER_MAX) buffer.shift();
  buffer.push(entry);
}

export function getLogBuffer(): Readonly<LogEntry[]> {
  return buffer;
}

export function clearLogBuffer() {
  buffer.length = 0;
}

// ─── Console Colours ─────────────────────────────────────────────────────────
const COLORS: Record<LogSeverity, string> = {
  [LogSeverity.DEBUG]:    'color: #94a3b8',
  [LogSeverity.INFO]:     'color: #60a5fa',
  [LogSeverity.WARN]:     'color: #fbbf24; font-weight: bold',
  [LogSeverity.ERROR]:    'color: #f87171; font-weight: bold',
  [LogSeverity.CRITICAL]: 'color: #ef4444; font-weight: 900; font-size: 1.1em',
};

// ─── Logger Class ─────────────────────────────────────────────────────────────

export class Logger {
  private module: string;
  private userId: string | null = null;
  private screen: string | null = null;
  private category: LogCategory;

  constructor(module: string, category: LogCategory = LogCategory.APP) {
    this.module = module;
    this.category = category;
  }

  /** Call when the current user changes */
  setUserId(id: string | null) {
    this.userId = id;
  }

  /** Call when the active screen changes */
  setScreen(screen: string | null) {
    this.screen = screen;
  }

  private emit(
    severity: LogSeverity,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      correlationId: getCorrelationId(),
      userId: this.userId,
      module: this.module,
      screen: this.screen,
      severity,
      category: this.category,
      message,
      metadata,
      error: error
        ? { name: error.name, message: error.message, stack: error.stack }
        : undefined,
    };

    pushToBuffer(entry);

    if (buildConfig.isDevelopment) {
      const prefix = `%c[${severity}] [${this.module}]`;
      if (severity === LogSeverity.ERROR || severity === LogSeverity.CRITICAL) {
        console.error(prefix, COLORS[severity], message, metadata ?? '', error ?? '');
      } else if (severity === LogSeverity.WARN) {
        console.warn(prefix, COLORS[severity], message, metadata ?? '');
      } else if (severity === LogSeverity.DEBUG) {
        console.debug(prefix, COLORS[severity], message, metadata ?? '');
      } else {
        console.log(prefix, COLORS[severity], message, metadata ?? '');
      }
    }
    // Production: buffer-only (ready for remote sink integration)
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.emit(LogSeverity.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.emit(LogSeverity.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.emit(LogSeverity.WARN, message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>, error?: Error) {
    this.emit(LogSeverity.ERROR, message, metadata, error);
  }

  critical(message: string, metadata?: Record<string, unknown>, error?: Error) {
    this.emit(LogSeverity.CRITICAL, message, metadata, error);
  }
}

// ─── Module-scoped factory ───────────────────────────────────────────────────

const loggerCache = new Map<string, Logger>();

export function createLogger(module: string, category?: LogCategory): Logger {
  const key = `${module}:${category ?? LogCategory.APP}`;
  if (!loggerCache.has(key)) {
    loggerCache.set(key, new Logger(module, category));
  }
  return loggerCache.get(key)!;
}

// Default application logger
export const logger = createLogger('App', LogCategory.APP);
