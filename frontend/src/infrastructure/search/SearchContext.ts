import { createContext } from 'react';
import type { SearchResult, SearchProviderInstance } from './types';

export interface SearchContextType {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  setQuery: (q: string) => void;
  registerSearchProvider: (provider: SearchProviderInstance) => () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);
