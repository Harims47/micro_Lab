import { useContext, useMemo } from 'react';
import type { Logger } from './logger';
import type { LogCategory } from './types';
import { LoggerContext } from './LoggerContext';

/**
 * Returns a module-scoped logger instance.
 * Instances are cached — calling with the same module+category returns the same Logger.
 */
export const useLogger = (module: string, category?: LogCategory): Logger => {
  const { createModuleLogger } = useContext(LoggerContext);
  return useMemo(() => createModuleLogger(module, category), [createModuleLogger, module, category]);
};
