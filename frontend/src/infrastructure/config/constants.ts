/**
 * Application Constants
 * Immutable values shared across the entire application.
 * No business logic — no side effects.
 */

export const APP_NAME = 'Micro Lab LIMS';
export const APP_VERSION = '1.0.0-mvp';

// API
export const API_TIMEOUT_MS = 30_000;         // 30s default request timeout
export const API_RETRY_COUNT = 3;             // retry attempts on transient failure
export const API_RETRY_DELAY_MS = 1_000;      // base delay between retries (exponential backoff)

// Sessions
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;    // 30 minutes
export const SESSION_WARNING_MS = 5 * 60 * 1000;     // warn 5 minutes before expiry

// File Upload
export const MAX_UPLOAD_MB = 25;
export const ACCEPTED_UPLOAD_TYPES = ['.csv', '.pdf', '.xlsx', '.jpg', '.png'] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

// Toast Notifications
export const TOAST_DEFAULT_DURATION_MS = 5_000;
export const TOAST_ERROR_DURATION_MS = 8_000;
export const TOAST_MAX_VISIBLE = 5;

// Search
export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_MAX_RESULTS = 50;

// Audit
export const AUDIT_LOG_RETENTION_DAYS = 365;

// UI
export const SIDEBAR_WIDTH_PX = 260;
export const HEADER_HEIGHT_PX = 56;
export const BREAKPOINT_MD_PX = 768;
export const BREAKPOINT_LG_PX = 1024;
export const BREAKPOINT_XL_PX = 1280;
