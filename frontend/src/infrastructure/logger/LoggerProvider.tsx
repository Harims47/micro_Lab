import React, { useMemo } from 'react';
import { createLogger } from './logger';
import { LoggerContext, type LoggerContextType } from './LoggerContext';

export const LoggerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo<LoggerContextType>(
    () => ({ createModuleLogger: createLogger }),
    []
  );

  return (
    <LoggerContext.Provider value={value}>
      {children}
    </LoggerContext.Provider>
  );
};
