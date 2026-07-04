import type { HttpResponse } from './types';

type MockHandler<T = unknown> = (body?: any, url?: string) => T;

interface MockRoute<T = unknown> {
  handler: MockHandler<T>;
  latencyMs: number;
  errorRate: number;   // 0–1: probability of returning a 500
}

const routes = new Map<string, MockRoute>();

function routeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

function randomLatency(base: number) {
  return base + Math.random() * base * 0.5;
}

const mockAdapter = {
  /**
   * Register a mock endpoint.
   * @example
   *   mockAdapter.register('GET', '/patients', () => mockPatients, { latencyMs: 80 })
   */
  register<T>(
    method: string,
    path: string,
    handler: MockHandler<T>,
    opts: { latencyMs?: number; errorRate?: number } = {}
  ) {
    routes.set(routeKey(method, path), {
      handler: handler as MockHandler,
      latencyMs: opts.latencyMs ?? 80,
      errorRate: opts.errorRate ?? 0,
    });
  },

  /**
   * Remove a registered mock endpoint.
   */
  unregister(method: string, path: string) {
    routes.delete(routeKey(method, path));
  },

  /**
   * Returns true if the adapter has a handler for the given route.
   */
  has(method: string, path: string): boolean {
    const cleanPath = path.split('?')[0];
    if (routes.has(routeKey(method, cleanPath))) return true;
    for (const key of routes.keys()) {
      const parts = key.split(':');
      const m = parts[0];
      const p = parts.slice(1).join(':');
      if (m === method.toUpperCase() && (p.startsWith('^') || p.includes('\\/'))) {
        try {
          if (new RegExp(p).test(cleanPath)) return true;
        } catch {
          // Ignore invalid regex keys
        }
      }
    }
    return false;
  },

  /**
   * Intercepts a request and returns a mock response.
   * Returns null if no matching route is registered.
   */
  async intercept<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<HttpResponse<T> | null> {
    const cleanPath = path.split('?')[0];
    let route = routes.get(routeKey(method, cleanPath));

    if (!route) {
      for (const [key, val] of routes.entries()) {
        const parts = key.split(':');
        const m = parts[0];
        const p = parts.slice(1).join(':');
        if (m === method.toUpperCase() && (p.startsWith('^') || p.includes('\\/'))) {
          try {
            if (new RegExp(p).test(cleanPath)) {
              route = val;
              break;
            }
          } catch {
            // Ignore
          }
        }
      }
    }

    if (!route) return null;

    // Simulate network latency
    await new Promise((res) => setTimeout(res, randomLatency(route.latencyMs)));

    // Simulate error rate
    if (route.errorRate > 0 && Math.random() < route.errorRate) {
      throw { status: 500, message: 'Simulated mock server error' };
    }

    // Extract query parameters for GET requests, otherwise send request body payload
    let firstArg = body;
    if (method.toUpperCase() === 'GET') {
      const searchStr = path.split('?')[1] || '';
      const searchParams = new URLSearchParams(searchStr);
      firstArg = Object.fromEntries(searchParams.entries());
    }

    const data = route.handler(firstArg, path) as T;
    return {
      data,
      status: 200,
      headers: {
        'content-type': 'application/json',
        'x-mock': 'true',
      },
    };
  },

  /** List all registered routes (for debugging) */
  listRoutes(): string[] {
    return Array.from(routes.keys());
  },

  /** Clear all routes (used in tests) */
  clearRoutes() {
    routes.clear();
  },
};

export { mockAdapter };
