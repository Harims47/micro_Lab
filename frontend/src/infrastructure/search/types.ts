export interface SearchResult {
  id: string;
  category: 'patient' | 'order' | 'specimen' | 'culture' | 'ast' | 'report' | 'navigation';
  title: string;
  subtitle?: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export interface SearchProviderInstance {
  name: string;
  category: SearchResult['category'];
  search: (query: string) => Promise<SearchResult[]> | SearchResult[];
}
