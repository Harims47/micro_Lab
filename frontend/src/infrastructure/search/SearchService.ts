import type { SearchResult, SearchProviderInstance } from './types';
import { createLogger } from '../logger/logger';
import { LogCategory } from '../logger/types';

const log = createLogger('SearchService', LogCategory.SYSTEM);
const providers = new Set<SearchProviderInstance>();

export const SearchService = {
  /**
   * Registers a search provider. Call this when business modules mount or initialize.
   * Returns a cleanup function to unregister the provider.
   */
  registerProvider(provider: SearchProviderInstance): () => void {
    providers.add(provider);
    log.info(`Search provider registered: ${provider.name} (category: ${provider.category})`);
    return () => {
      providers.delete(provider);
      log.info(`Search provider unregistered: ${provider.name}`);
    };
  },

  /**
   * Queries all registered search providers in parallel and returns aggregated results.
   */
  async query(query: string): Promise<SearchResult[]> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    log.debug('Executing global search query', { query: trimmed });

    const promises = Array.from(providers).map(async (provider) => {
      try {
        const results = await provider.search(trimmed);
        return results;
      } catch (err) {
        log.error(`Search provider ${provider.name} failed`, { query: trimmed }, err as Error);
        return [];
      }
    });

    const nestedResults = await Promise.all(promises);
    return nestedResults.flat();
  },

  /** Returns all currently active search providers (for diagnostics/debugging) */
  getActiveProviders(): string[] {
    return Array.from(providers).map((p) => p.name);
  },
};
