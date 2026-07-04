/**
 * Runtime Configuration
 * Values that can vary per deployment without a rebuild.
 * Loaded from window.__APP_CONFIG__ injected by the server at runtime.
 * Falls back to sensible development defaults.
 */

export interface RuntimeConfig {
  apiBaseUrl: string;
  authBaseUrl: string;
  featureOverrides: Record<string, boolean>;
}

// Extend Window to include the server-injected config blob
declare global {
  interface Window {
    __APP_CONFIG__?: Partial<RuntimeConfig>;
  }
}

const serverConfig: Partial<RuntimeConfig> = window.__APP_CONFIG__ ?? {};

export const runtimeConfig: RuntimeConfig = {
  apiBaseUrl: serverConfig.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  authBaseUrl: serverConfig.authBaseUrl ?? import.meta.env.VITE_AUTH_BASE_URL ?? 'http://localhost:8080/auth',
  featureOverrides: serverConfig.featureOverrides ?? {},
};
