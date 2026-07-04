import { createContext } from 'react';
import type { Logger } from './logger';
import { createLogger } from './logger';
import { LogCategory } from './types';

export interface LoggerContextType {
  createModuleLogger: (module: string, category?: LogCategory) => Logger;
}

export const LoggerContext = createContext<LoggerContextType>({
  createModuleLogger: createLogger,
});
