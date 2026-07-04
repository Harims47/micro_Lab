export interface FeatureFlags {
  enableAstV2: boolean;
  enableSpecimenRejection: boolean;
  enableNotificationsCenter: boolean;
  enableCommandPalette: boolean;
  enableOfflineMode: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;
