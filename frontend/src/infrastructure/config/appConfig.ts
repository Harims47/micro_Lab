/**
 * Application Configuration
 * Composed from build + runtime config into a single typed object.
 * This is the primary config object consumed by the rest of the application.
 */
import { buildConfig } from './buildConfig';
import { runtimeConfig } from './runtimeConfig';
import {
  API_TIMEOUT_MS,
  API_RETRY_COUNT,
  API_RETRY_DELAY_MS,
  SESSION_TIMEOUT_MS,
  SESSION_WARNING_MS,
  MAX_UPLOAD_MB,
  ACCEPTED_UPLOAD_TYPES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './constants';

export interface AppConfig {
  env: typeof buildConfig.env;
  version: string;
  isDevelopment: boolean;
  isProduction: boolean;

  api: {
    baseUrl: string;
    timeoutMs: number;
    retryCount: number;
    retryDelayMs: number;
  };

  auth: {
    baseUrl: string;
  };

  session: {
    timeoutMs: number;
    warningMs: number;
  };

  upload: {
    maxSizeMb: number;
    acceptedTypes: readonly string[];
  };

  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
}

export const appConfig: AppConfig = {
  env: buildConfig.env,
  version: buildConfig.version,
  isDevelopment: buildConfig.isDevelopment,
  isProduction: buildConfig.isProduction,

  api: {
    baseUrl: runtimeConfig.apiBaseUrl,
    timeoutMs: API_TIMEOUT_MS,
    retryCount: API_RETRY_COUNT,
    retryDelayMs: API_RETRY_DELAY_MS,
  },

  auth: {
    baseUrl: runtimeConfig.authBaseUrl,
  },

  session: {
    timeoutMs: SESSION_TIMEOUT_MS,
    warningMs: SESSION_WARNING_MS,
  },

  upload: {
    maxSizeMb: MAX_UPLOAD_MB,
    acceptedTypes: ACCEPTED_UPLOAD_TYPES,
  },

  pagination: {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    maxPageSize: MAX_PAGE_SIZE,
  },
};
