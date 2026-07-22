/**
 * In-memory API response cache with stale-while-revalidate support.
 * Optimized for slow connections (2G/3G) where re-fetching is expensive.
 *
 * Pattern: return cached data instantly → refresh in background → update cache.
 */

import { getConnectionQuality, type ConnectionQuality } from './connectionQuality';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  /** When this entry was last refreshed (background revalidation) */
  refreshedAt: number;
}

// Connection-aware TTL values (milliseconds)
const TTL_BY_CONNECTION: Record<ConnectionQuality, number> = {
  fast: 2 * 60 * 1000,      // 2 minutes — fast connections can refetch easily
  moderate: 5 * 60 * 1000,  // 5 minutes
  slow: 10 * 60 * 1000,     // 10 minutes — slow connections benefit from longer cache
  offline: 30 * 60 * 1000,  // 30 minutes — serve stale data as long as possible
};

// Max stale age (how long to serve stale data while revalidating in background)
const STALE_WHILE_REVALIDATE: Record<ConnectionQuality, number> = {
  fast: 5 * 60 * 1000,
  moderate: 10 * 60 * 1000,
  slow: 20 * 60 * 1000,
  offline: 60 * 60 * 1000,
};

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private inflight = new Map<string, Promise<any>>();

  /**
   * Get cached data if fresh enough, otherwise return null.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const { quality } = getConnectionQuality();
    const ttl = TTL_BY_CONNECTION[quality];
    const age = Date.now() - entry.timestamp;

    if (age < ttl) {
      return entry.data as T;
    }

    return null;
  }

  /**
   * Get cached data even if stale (for stale-while-revalidate pattern).
   * Returns null only if no cached data exists at all.
   */
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const { quality } = getConnectionQuality();
    const maxStaleAge = STALE_WHILE_REVALIDATE[quality];
    const age = Date.now() - entry.timestamp;

    if (age < maxStaleAge) {
      return entry.data as T;
    }

    // Too stale, discard
    this.cache.delete(key);
    return null;
  }

  /**
   * Store data in cache.
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      refreshedAt: Date.now(),
    });
  }

  /**
   * Fetch with cache — the primary interface.
   *
   * 1. If fresh cache exists → return immediately
   * 2. If stale cache exists → return stale + revalidate in background
   * 3. No cache → fetch, cache, return
   *
   * Deduplicates concurrent requests for the same key.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    // 1. Try fresh cache
    const fresh = this.get<T>(key);
    if (fresh !== null) {
      return fresh;
    }

    // 2. Try stale cache (return immediately, revalidate in background)
    const stale = this.getStale<T>(key);
    if (stale !== null) {
      // Background revalidation (fire-and-forget)
      this.revalidate(key, fetcher);
      return stale;
    }

    // 3. No cache at all — must fetch
    return this.fetchAndCache(key, fetcher);
  }

  /**
   * Fetch and cache, with inflight deduplication.
   */
  private async fetchAndCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Deduplicate concurrent requests
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetcher()
      .then((data) => {
        this.set(key, data);
        this.inflight.delete(key);
        return data;
      })
      .catch((err) => {
        this.inflight.delete(key);
        throw err;
      });

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Background revalidation — updates cache silently.
   */
  private revalidate<T>(key: string, fetcher: () => Promise<T>): void {
    // Don't revalidate if already in flight
    if (this.inflight.has(key)) return;

    const entry = this.cache.get(key);
    // Don't revalidate too frequently (minimum 30 seconds between revalidations)
    if (entry && Date.now() - entry.refreshedAt < 30_000) return;

    this.fetchAndCache(key, fetcher).catch(() => {
      // Background revalidation failures are silent
    });
  }

  /**
   * Invalidate a specific cache key.
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached data.
   */
  clear(): void {
    this.cache.clear();
    this.inflight.clear();
  }
}

// Singleton instance
export const apiCache = new ApiCache();

// Cache keys
export const CACHE_KEYS = {
  PUBLIC_TECHNICIANS: 'public_technicians',
  PUBLIC_TECHNICIANS_LITE: 'public_technicians_lite',
  PUBLIC_ARTICLES: 'public_articles',
} as const;
