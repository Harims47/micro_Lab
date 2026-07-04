import type { FeatureFlags } from './types';
import { buildConfig } from '../config/buildConfig';

/**
 * Default Feature Flag configuration.
 * Development environments enable experimental flags, production turns them off.
 */
export const defaultFeatureFlags: FeatureFlags = {
  enableAstV2: buildConfig.isDevelopment,
  enableSpecimenRejection: true,
  enableNotificationsCenter: true,
  enableCommandPalette: true,
  enableOfflineMode: false,
};
