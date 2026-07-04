import React, { useState, useMemo, useCallback } from 'react';
import type { FeatureFlags, FeatureFlagKey } from './types';
import { defaultFeatureFlags } from './featureFlags.config';
import { runtimeConfig } from '../config/runtimeConfig';
import { FeatureFlagContext, type FeatureFlagContextType } from './FeatureFlagContext';

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store runtime overrides (e.g. from diagnostics panel or session settings)
  const [overrides, setOverrides] = useState<Partial<FeatureFlags>>(() => {
    // Read from localStorage if present
    try {
      const saved = localStorage.getItem('lims_feature_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Compose runtimeConfig (server overrides) + user overrides + defaults
  const composedFlags = useMemo<FeatureFlags>(() => {
    return {
      ...defaultFeatureFlags,
      ...runtimeConfig.featureOverrides,
      ...overrides,
    };
  }, [overrides]);

  const isEnabled = useCallback(
    (flag: FeatureFlagKey): boolean => {
      return composedFlags[flag] ?? false;
    },
    [composedFlags]
  );

  const setOverride = useCallback((flag: FeatureFlagKey, value: boolean) => {
    setOverrides((prev) => {
      const updated = { ...prev, [flag]: value };
      try {
        localStorage.setItem('lims_feature_overrides', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to write feature overrides to localStorage', err);
      }
      return updated;
    });
  }, []);

  const clearOverrides = useCallback(() => {
    setOverrides({});
    try {
      localStorage.removeItem('lims_feature_overrides');
    } catch (err) {
      console.error('Failed to clear feature overrides in localStorage', err);
    }
  }, []);

  const contextValue = useMemo<FeatureFlagContextType>(
    () => ({
      flags: composedFlags,
      isEnabled,
      setOverride,
      clearOverrides,
    }),
    [composedFlags, isEnabled, setOverride, clearOverrides]
  );

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
