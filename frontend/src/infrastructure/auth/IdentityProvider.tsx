import React, { useState, useEffect, useCallback } from 'react';
import type { UserRole } from '../../types';
import type { AuthenticatedUser, UserPreferences, UserLaboratory } from './types';
import { IdentityContext, type IdentityContextType } from './IdentityContext';

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AuthenticatedUser | null>(null);

  // Sync user visual preferences directly to HTML document elements
  useEffect(() => {
    if (user?.preferences) {
      document.documentElement.setAttribute('data-theme', user.preferences.theme);
      document.documentElement.setAttribute('data-density', user.preferences.density);
    } else {
      // Default fallback
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-density', 'comfortable');
    }
  }, [user]);

  const setUser = useCallback((newUser: AuthenticatedUser | null) => {
    setUserState(newUser);
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    setUserState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...newPrefs,
        },
      };
    });
  }, []);

  const updateLaboratory = useCallback((newLab: UserLaboratory) => {
    setUserState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        laboratory: newLab,
      };
    });
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUserState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activeRole: role,
      };
    });
  }, []);

  const contextValue = React.useMemo<IdentityContextType>(
    () => ({
      user,
      setUser,
      updatePreferences,
      updateLaboratory,
      switchRole,
    }),
    [user, setUser, updatePreferences, updateLaboratory, switchRole]
  );

  return (
    <IdentityContext.Provider value={contextValue}>
      {children}
    </IdentityContext.Provider>
  );
};
