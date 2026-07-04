import { createContext } from 'react';
import type { AppConfig } from './appConfig';
import { appConfig } from './appConfig';

export const ConfigContext = createContext<AppConfig>(appConfig);
