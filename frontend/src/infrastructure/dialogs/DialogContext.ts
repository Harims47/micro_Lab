import { createContext } from 'react';
import type {
  DialogOptions,
  DeleteConfirmOptions,
  UnsavedChangesOptions,
  SessionExpiredOptions,
} from './types';

export interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  confirmDelete: (options: DeleteConfirmOptions) => Promise<boolean>;
  confirmUnsavedChanges: (options?: UnsavedChangesOptions) => Promise<boolean>;
  showSessionExpired: (options?: SessionExpiredOptions) => Promise<void>;
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined);
