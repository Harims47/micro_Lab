import type { AppError } from '../errors/types';

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  /** Deduplication key — if a pending request with the same key exists, returns its promise */
  dedupe?: string;
  /** Request headers to merge */
  headers?: Record<string, string>;
  onUploadProgress?: (percent: number) => void;
  onDownloadProgress?: (percent: number) => void;
}

export interface PollOptions<T> {
  intervalMs: number;
  maxAttempts?: number;
  stopWhen?: (result: T) => boolean;
}

export interface PollController {
  start: () => void;
  stop: () => void;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface HttpError extends AppError {
  status: number;
  endpoint: string;
}

export interface OptimisticOptions<T> {
  /** Apply optimistic state immediately */
  apply: (current: T) => T;
  /** Roll back if request fails */
  rollback: (current: T) => T;
}

export type RequestInterceptor = (
  url: string,
  options: RequestInit & { _meta?: Record<string, unknown> }
) => RequestInit & { _meta?: Record<string, unknown> };

export type ResponseInterceptor = (response: HttpResponse<any>) => HttpResponse<any>;
export type ErrorInterceptor = (error: HttpError) => HttpError;
