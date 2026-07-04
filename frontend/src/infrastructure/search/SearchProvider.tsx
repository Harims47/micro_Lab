import React, { useState, useEffect, useCallback } from 'react';
import type { SearchResult, SearchProviderInstance } from './types';
import { SearchService } from './SearchService';
import { SEARCH_DEBOUNCE_MS } from '../config/constants';
import { SearchContext, type SearchContextType } from './SearchContext';

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search query implementation
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const searchResults = await SearchService.query(trimmed);
        setResults(searchResults);
      } catch (err) {
        console.error('Global search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const registerSearchProvider = useCallback((provider: SearchProviderInstance) => {
    return SearchService.registerProvider(provider);
  }, []);

  const contextValue = React.useMemo<SearchContextType>(
    () => ({
      query,
      results,
      isSearching,
      setQuery,
      registerSearchProvider,
    }),
    [query, results, isSearching, registerSearchProvider]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

