import type {
  RequestOptions,
  HttpResponse,
  HttpError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  PollOptions,
  PollController,
} from './types';
import { mockAdapter } from './mockAdapter';
import { mapHttpError } from '../errors/errorMap';
import { appConfig } from '../config/appConfig';
import { createLogger } from '../logger/logger';
import { LogCategory } from '../logger/types';

const log = createLogger('HttpClient', LogCategory.HTTP);

// ─── Active Requests for Deduplication ───────────────────────────────────────
const pendingRequests = new Map<string, Promise<unknown>>();

// ─── HttpClient Class ────────────────────────────────────────────────────────

export class HttpClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = appConfig.api.baseUrl) {
    this.baseUrl = baseUrl;
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Performs an HTTP request with full features (retry, timeout, deduplication, interception, mock adapter support).
   */
  async request<T>(
    method: string,
    url: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const dedupeKey = options.dedupe ? `${method}:${fullUrl}:${options.dedupe}` : null;

    if (dedupeKey && pendingRequests.has(dedupeKey)) {
      log.debug('Deduplicated request', { method, url, dedupeKey });
      return pendingRequests.get(dedupeKey) as Promise<HttpResponse<T>>;
    }

    const promise = this.executeRequestWithRetry<T>(method, fullUrl, body, options)
      .finally(() => {
        if (dedupeKey) {
          pendingRequests.delete(dedupeKey);
        }
      });

    if (dedupeKey) {
      pendingRequests.set(dedupeKey, promise);
    }

    return promise;
  }

  private async executeRequestWithRetry<T>(
    method: string,
    url: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const retries = options.retries ?? appConfig.api.retryCount;
    const retryDelay = options.retryDelay ?? appConfig.api.retryDelayMs;
    let attempt = 0;

    while (true) {
      try {
        return await this.executeSingleRequest<T>(method, url, body, options);
      } catch (err) {
        attempt++;
        const isTransient = this.isTransientError(err);
        const canRetry = attempt <= retries && isTransient;

        log.warn(`Request failed (attempt ${attempt}/${retries + 1})`, {
          method,
          url,
          isTransient,
          canRetry,
          error: err,
        });

        if (!canRetry) {
          throw err;
        }

        // Exponential backoff delay
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private async executeSingleRequest<T>(
    method: string,
    url: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    // 1. Resolve relative path for mock check
    const path = url.startsWith(this.baseUrl) ? url.substring(this.baseUrl.length) : url;

    // 2. Intercept mock endpoints
    if (mockAdapter.has(method, path)) {
      log.debug('Mock adapter intercepting route', { method, path });
      this.simulateProgress(options);
      const mockRes = await mockAdapter.intercept<T>(method, path, body);
      if (mockRes) {
        let res = mockRes;
        for (const interceptor of this.responseInterceptors) {
          res = interceptor(res);
        }
        return res;
      }
    }

    // 3. Apply Request Interceptors
    let init: RequestInit & { _meta?: Record<string, unknown> } = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: options.signal,
    };

    for (const interceptor of this.requestInterceptors) {
      init = interceptor(url, init);
    }

    // 4. Setup Timeout
    const timeout = options.timeout ?? appConfig.api.timeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge signals if options.signal is provided
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    init.signal = controller.signal;

    try {
      this.simulateProgress(options);
      const fetchResponse = await fetch(url, init);
      clearTimeout(timeoutId);

      const headersRecord: Record<string, string> = {};
      fetchResponse.headers.forEach((val, key) => {
        headersRecord[key] = val;
      });

      const contentType = headersRecord['content-type'] || '';
      let responseData: unknown = null;
      if (contentType.includes('application/json')) {
        responseData = await fetchResponse.json();
      } else {
        responseData = await fetchResponse.text();
      }

      if (!fetchResponse.ok) {
        const errorDetail = mapHttpError(fetchResponse.status, responseData, url);
        throw {
          ...errorDetail,
          status: fetchResponse.status,
          endpoint: url,
        } as HttpError;
      }

      let response: HttpResponse<T> = {
        data: responseData as T,
        status: fetchResponse.status,
        headers: headersRecord,
      };

      // 5. Apply Response Interceptors
      for (const interceptor of this.responseInterceptors) {
        response = interceptor(response);
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      let httpError: HttpError;

      if ((err as HttpError).status !== undefined) {
        httpError = err as HttpError;
      } else {
        const mapped = mapHttpError(0, err, url);
        httpError = {
          ...mapped,
          status: 0,
          endpoint: url,
        };
      }

      // 6. Apply Error Interceptors
      for (const interceptor of this.errorInterceptors) {
        httpError = interceptor(httpError);
      }

      throw httpError;
    }
  }

  private isTransientError(err: unknown): boolean {
    const error = err as HttpError;
    if (!error) return false;
    // Network errors or 503 Service Unavailable / 429 Rate Limited are transient
    return (
      error.status === 0 ||
      error.status === 429 ||
      error.status === 503
    );
  }

  private simulateProgress(options: RequestOptions) {
    if (options.onUploadProgress) {
      setTimeout(() => options.onUploadProgress?.(30), 20);
      setTimeout(() => options.onUploadProgress?.(70), 50);
      setTimeout(() => options.onUploadProgress?.(100), 80);
    }
    if (options.onDownloadProgress) {
      setTimeout(() => options.onDownloadProgress?.(25), 30);
      setTimeout(() => options.onDownloadProgress?.(60), 60);
      setTimeout(() => options.onDownloadProgress?.(100), 90);
    }
  }

  // ─── HTTP Verb Helpers ──────────────────────────────────────────────────────

  async get<T>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, body, options);
  }

  async put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, body, options);
  }

  async patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, body, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  // ─── Polling ────────────────────────────────────────────────────────────────

  poll<T>(
    url: string,
    options: PollOptions<T>,
    requestOptions?: RequestOptions
  ): PollController {
    let timerId: number | null = null;
    let attempts = 0;
    let isStopped = false;

    const executePoll = async () => {
      if (isStopped) return;
      attempts++;

      try {
        const response = await this.get<T>(url, requestOptions);
        if (options.stopWhen?.(response.data)) {
          stop();
          return;
        }
      } catch (err) {
        log.error('Poll request failed', { url, attempt: attempts }, err as Error);
      }

      if (options.maxAttempts && attempts >= options.maxAttempts) {
        log.warn('Max polling attempts reached, stopping poll', { url, attempts });
        stop();
        return;
      }

      if (!isStopped) {
        timerId = window.setTimeout(executePoll, options.intervalMs);
      }
    };

    const start = () => {
      if (timerId !== null || isStopped) return;
      executePoll();
    };

    const stop = () => {
      isStopped = true;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    };

    return { start, stop };
  }
}

// ─── Global Client Instantiation ─────────────────────────────────────────────

import { authInterceptor, correlationInterceptor, responseNormalizerInterceptor } from './interceptors';

export const httpClient = new HttpClient();

// Register default interceptors
httpClient.addRequestInterceptor(authInterceptor);
httpClient.addRequestInterceptor(correlationInterceptor);
httpClient.addResponseInterceptor(responseNormalizerInterceptor);
