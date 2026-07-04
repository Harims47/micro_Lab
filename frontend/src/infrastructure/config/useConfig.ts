import { useContext } from 'react';
import type { AppConfig } from './appConfig';
import { ConfigContext } from './ConfigContext';

export const useConfig = (): AppConfig => useContext(ConfigContext);
