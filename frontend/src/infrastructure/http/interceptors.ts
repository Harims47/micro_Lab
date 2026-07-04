import type { RequestInterceptor, ResponseInterceptor } from './types';
import { getCorrelationId } from '../logger/correlationId';
import { appConfig } from '../config/appConfig';

// ─── Auth Interceptor ────────────────────────────────────────────────────────

import { TokenStorageInstance } from '../auth/TokenStorage';

export const authInterceptor: RequestInterceptor = (_url, options) => {
  const token = TokenStorageInstance.getAccessToken() || 'mock-dev-token-lims-2026';
  const existing = (options.headers as Record<string, string>) ?? {};
  return {
    ...options,
    headers: {
      ...existing,
      Authorization: `Bearer ${token}`,
    },
  };
};

// ─── Correlation ID Interceptor ──────────────────────────────────────────────

export const correlationInterceptor: RequestInterceptor = (_url, options) => {
  const existing = (options.headers as Record<string, string>) ?? {};
  return {
    ...options,
    headers: {
      ...existing,
      'X-Correlation-ID': getCorrelationId(),
      'X-Client-Version': appConfig.version,
    },
  };
};

// ─── Response Normalizer ─────────────────────────────────────────────────────

export const responseNormalizerInterceptor: ResponseInterceptor = (response) => {
  // If the API wraps responses in { data, status } — unwrap here
  const raw = response.data as Record<string, unknown>;
  if (raw && typeof raw === 'object' && 'data' in raw && 'status' in raw) {
    return { ...response, data: raw.data };
  }
  return response;
};
