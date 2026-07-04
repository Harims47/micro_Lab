import { createContext } from 'react';
import type { AuthenticatedUser, UserPreferences, UserLaboratory } from './types';

import type { UserRole } from '../../types';

export interface IdentityContextType {
  user: AuthenticatedUser | null;
  setUser: (user: AuthenticatedUser | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateLaboratory: (lab: UserLaboratory) => void;
  switchRole: (role: UserRole) => void;
}

export const IdentityContext = createContext<IdentityContextType | undefined>(undefined);
