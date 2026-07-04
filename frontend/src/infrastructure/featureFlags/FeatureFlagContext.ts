import { createContext } from 'react';
import type { FeatureFlags, FeatureFlagKey } from './types';

export interface FeatureFlagContextType {
  flags: FeatureFlags;
  isEnabled: (flag: FeatureFlagKey) => boolean;
  setOverride: (flag: FeatureFlagKey, value: boolean) => void;
  clearOverrides: () => void;
}

export const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);
