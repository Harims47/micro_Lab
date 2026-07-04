import React from 'react';
import type { AppConfig } from './appConfig';
import { appConfig } from './appConfig';
import { ConfigContext } from './ConfigContext';

export const ConfigProvider: React.FC<{ children: React.ReactNode; config?: AppConfig }> = ({
  children,
  config = appConfig,
}) => (
  <ConfigContext.Provider value={config}>
    {children}
  </ConfigContext.Provider>
);
