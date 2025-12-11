// apps/customer-frontend/src/features/delivery-checkin/services/cache.service.ts
/**
 * Cache Service for Delivery Check-in
 *
 * Provides caching utilities for:
 * - Map tile caching
 * - API response caching
 * - Check-in data caching
 *
 * **Feature: delivery-checkin-system, Property 44: Viewport Bounds Loading**
 * **Validates: Requirements 12.1, 12.5**
 */

import type { CheckinMarker, DeliveryCheckin, MapBounds } from "../types";

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // TTL in milliseconds
  TTL_SHORT: 60 * 1000, // 1 minute
  TTL_MEDIUM: 5 * 60 * 1000, // 5 minutes
  TTL_LONG: 30 * 60 * 1000, // 30 minutes

  // Map tile cache
  TILE_CACHE_SIZE: 100,

  // Check-in cache
  CHECKIN_CACHE_SIZE: 500,
  BOUNDS_CACHE_SIZE: 20,

  // Storage keys
  STORAGE_PREFIX: "delivery-checkin:",
};

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

/**
 * Generic in-memory cache with TTL and size limits
 */
class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl: number = CACHE_CONFIG.TTL_MEDIUM): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Evict oldest entries
   */
  private evictOldest(): void {
    // Sort by createdAt and remove oldest 10%
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    );

    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Bounds-based cache key generator
 */
function boundsToKey(bounds: MapBounds): string {
  // Round to 3 decimal places for cache key stability
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return `${round(bounds.minLng)}:${round(bounds.minLat)}:${round(
    bounds.maxLng
  )}:${round(bounds.maxLat)}`;
}

/**
 * Check if bounds are similar (within threshold)
 */
function boundsSimilar(
  a: MapBounds,
  b: MapBounds,
  threshold: number = 0.001
): boolean {
  return (
    Math.abs(a.minLng - b.minLng) < threshold &&
    Math.abs(a.minLat - b.minLat) < threshold &&
    Math.abs(a.maxLng - b.maxLng) < threshold &&
    Math.abs(a.maxLat - b.maxLat) < threshold
  );
}

/**
 * Delivery Check-in Cache Service
 */
class DeliveryCheckinCacheService {
  // Caches
  private checkinCache: MemoryCache<DeliveryCheckin>;
  private markersCache: MemoryCache<CheckinMarker[]>;
  private boundsCache: Map<string, MapBounds> = new Map();

  // Cleanup interval
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.checkinCache = new MemoryCache<DeliveryCheckin>(
      CACHE_CONFIG.CHECKIN_CACHE_SIZE
    );
    this.markersCache = new MemoryCache<CheckinMarker[]>(
      CACHE_CONFIG.BOUNDS_CACHE_SIZE
    );

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    if (typeof window !== "undefined") {
      this.cleanupInterval = setInterval(() => {
        this.checkinCache.cleanup();
        this.markersCache.cleanup();
      }, CACHE_CONFIG.TTL_MEDIUM);
    }
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // ============================================
  // Check-in Detail Cache
  // ============================================

  /**
   * Get cached check-in detail
   */
  getCheckin(checkinId: string): DeliveryCheckin | null {
    return this.checkinCache.get(`checkin:${checkinId}`);
  }

  /**
   * Cache check-in detail
   */
  setCheckin(checkin: DeliveryCheckin): void {
    this.checkinCache.set(
      `checkin:${checkin._id}`,
      checkin,
      CACHE_CONFIG.TTL_MEDIUM
    );
  }

  /**
   * Invalidate check-in cache
   */
  invalidateCheckin(checkinId: string): void {
    this.checkinCache.delete(`checkin:${checkinId}`);
  }

  // ============================================
  // Markers Cache (for map view)
  // ============================================

  /**
   * Get cached markers for bounds
   */
  getMarkersForBounds(bounds: MapBounds): CheckinMarker[] | null {
    // Check for exact match first
    const key = boundsToKey(bounds);
    const cached = this.markersCache.get(`markers:${key}`);
    if (cached) {
      return cached;
    }

    // Check for similar bounds
    for (const [cachedKey, cachedBounds] of this.boundsCache.entries()) {
      if (boundsSimilar(bounds, cachedBounds)) {
        const markers = this.markersCache.get(`markers:${cachedKey}`);
        if (markers) {
          return markers;
        }
      }
    }

    return null;
  }

  /**
   * Cache markers for bounds
   */
  setMarkersForBounds(bounds: MapBounds, markers: CheckinMarker[]): void {
    const key = boundsToKey(bounds);
    this.markersCache.set(`markers:${key}`, markers, CACHE_CONFIG.TTL_SHORT);
    this.boundsCache.set(key, bounds);

    // Limit bounds cache size
    if (this.boundsCache.size > CACHE_CONFIG.BOUNDS_CACHE_SIZE) {
      const firstKey = this.boundsCache.keys().next().value;
      if (firstKey) {
        this.boundsCache.delete(firstKey);
      }
    }
  }

  /**
   * Invalidate all markers cache
   */
  invalidateMarkers(): void {
    this.markersCache.clear();
    this.boundsCache.clear();
  }

  // ============================================
  // Local Storage Cache (for offline support)
  // ============================================

  /**
   * Save data to local storage
   */
  saveToStorage<T>(
    key: string,
    data: T,
    ttl: number = CACHE_CONFIG.TTL_LONG
  ): void {
    if (typeof window === "undefined") return;

    try {
      const entry: CacheEntry<T> = {
        data,
        expiresAt: Date.now() + ttl,
        createdAt: Date.now(),
      };
      localStorage.setItem(
        `${CACHE_CONFIG.STORAGE_PREFIX}${key}`,
        JSON.stringify(entry)
      );
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }

  /**
   * Load data from local storage
   */
  loadFromStorage<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(
        `${CACHE_CONFIG.STORAGE_PREFIX}${key}`
      );
      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(`${CACHE_CONFIG.STORAGE_PREFIX}${key}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
      return null;
    }
  }

  /**
   * Remove item from local storage
   */
  removeFromStorage(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${CACHE_CONFIG.STORAGE_PREFIX}${key}`);
  }

  /**
   * Clear all local storage cache
   */
  clearStorage(): void {
    if (typeof window === "undefined") return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_CONFIG.STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get cache statistics
   */
  getStats(): {
    checkinCacheSize: number;
    markersCacheSize: number;
    boundsCacheSize: number;
  } {
    return {
      checkinCacheSize: this.checkinCache.size,
      markersCacheSize: this.markersCache.size,
      boundsCacheSize: this.boundsCache.size,
    };
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.checkinCache.clear();
    this.markersCache.clear();
    this.boundsCache.clear();
    this.clearStorage();
  }
}

// Export singleton instance
export const deliveryCheckinCacheService = new DeliveryCheckinCacheService();
