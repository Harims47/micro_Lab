import { useContext } from 'react';
import type { FeatureFlagKey } from './types';
import { FeatureFlagContext } from './FeatureFlagContext';

export const useFeatureFlag = (flag?: FeatureFlagKey) => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }

  if (flag) {
    return context.isEnabled(flag);
  }

  return context;
};
