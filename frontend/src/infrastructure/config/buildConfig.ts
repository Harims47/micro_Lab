/**
 * Build Configuration
 * Values baked in at compile time via import.meta.env.
 * These are IMMUTABLE at runtime.
 */

export type BuildEnv = 'development' | 'staging' | 'production';

export interface BuildConfig {
  env: BuildEnv;
  version: string;
  buildTimestamp: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

function resolveBuildEnv(): BuildEnv {
  const mode = import.meta.env.MODE;
  if (mode === 'production') return 'production';
  if (mode === 'staging') return 'staging';
  return 'development';
}

export const buildConfig: BuildConfig = {
  env: resolveBuildEnv(),
  version: import.meta.env.VITE_APP_VERSION ?? '0.0.0-dev',
  buildTimestamp: import.meta.env.VITE_BUILD_TIMESTAMP ?? new Date().toISOString(),
  isDevelopment: import.meta.env.DEV === true,
  isProduction: import.meta.env.PROD === true,
};
