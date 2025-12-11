// apps/customer-backend/src/services/performance-optimization.service.js
/**
 * Performance Optimization Service
 *
 * Provides performance optimization utilities for the delivery check-in system:
 * - Parallel photo processing with concurrency control
 * - Query optimization helpers
 * - Response caching utilities
 * - Batch processing utilities
 *
 * **Feature: delivery-checkin-system, Property 42: Parallel Photo Processing**
 * **Validates: Requirements 11.6, 12.1, 12.5**
 */

import { Logger } from "../shared/utils/logger.util.js";

/**
 * Configuration for performance optimization
 */
export const PERFORMANCE_CONFIG = {
  // Photo processing
  MAX_CONCURRENT_UPLOADS: 5,
  PHOTO_PROCESSING_TIMEOUT: 30000, // 30 seconds
  BATCH_SIZE: 10,

  // Query optimization
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  GEOSPATIAL_QUERY_LIMIT: 500,

  // Caching
  CACHE_TTL_SHORT: 60, // 1 minute
  CACHE_TTL_MEDIUM: 300, // 5 minutes
  CACHE_TTL_LONG: 3600, // 1 hour

  // API response
  MAX_RESPONSE_TIME_MS: 2000, // 2 seconds target
};

/**
 * PerformanceOptimizationService
 *
 * Provides utilities for optimizing performance across the delivery check-in system
 */
export class PerformanceOptimizationService {
  constructor() {
    this.cache = new Map();
    this.processingQueue = [];
    this.activeProcesses = 0;
  }

  /**
   * Process items in parallel with concurrency control
   *
   * **Feature: delivery-checkin-system, Property 42: Parallel Photo Processing**
   * **Validates: Requirements 11.6**
   *
   * @param {Array} items - Items to process
   * @param {Function} processor - Async function to process each item
   * @param {Object} options - Processing options
   * @returns {Promise<Array>} Processed results
   */
  async processInParallel(items, processor, options = {}) {
    const {
      maxConcurrent = PERFORMANCE_CONFIG.MAX_CONCURRENT_UPLOADS,
      timeout = PERFORMANCE_CONFIG.PHOTO_PROCESSING_TIMEOUT,
      onProgress = null,
    } = options;

    if (!items || items.length === 0) {
      return [];
    }

    Logger.debug(
      `[PerfOptSvc] Processing ${items.length} items with concurrency ${maxConcurrent}`
    );

    const results = [];
    const errors = [];
    let completed = 0;

    // Create a pool of promises
    const pool = [];
    let itemIndex = 0;

    const processNext = async () => {
      if (itemIndex >= items.length) {
        return;
      }

      const currentIndex = itemIndex++;
      const item = items[currentIndex];

      try {
        // Wrap processor with timeout
        const result = await this.withTimeout(
          processor(item, currentIndex),
          timeout
        );
        results[currentIndex] = { success: true, data: result };
      } catch (error) {
        Logger.error(
          `[PerfOptSvc] Failed to process item ${currentIndex}:`,
          error
        );
        results[currentIndex] = { success: false, error: error.message };
        errors.push({ index: currentIndex, error });
      }

      completed++;
      if (onProgress) {
        onProgress(completed, items.length);
      }

      // Process next item
      await processNext();
    };

    // Start initial batch of concurrent processes
    const initialBatch = Math.min(maxConcurrent, items.length);
    for (let i = 0; i < initialBatch; i++) {
      pool.push(processNext());
    }

    // Wait for all to complete
    await Promise.all(pool);

    Logger.debug(
      `[PerfOptSvc] Completed processing ${completed} items, ${errors.length} errors`
    );

    return results;
  }

  /**
   * Wrap a promise with timeout
   * @param {Promise} promise - Promise to wrap
   * @param {number} ms - Timeout in milliseconds
   * @returns {Promise}
   */
  async withTimeout(promise, ms) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Process items in batches
   * @param {Array} items - Items to process
   * @param {Function} batchProcessor - Function to process a batch
   * @param {number} batchSize - Size of each batch
   * @returns {Promise<Array>} All results
   */
  async processInBatches(
    items,
    batchProcessor,
    batchSize = PERFORMANCE_CONFIG.BATCH_SIZE
  ) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await batchProcessor(batch, i);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Simple in-memory cache with TTL
   * @param {string} key - Cache key
   * @param {Function} fetcher - Function to fetch data if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or fetched data
   */
  async getCached(key, fetcher, ttl = PERFORMANCE_CONFIG.CACHE_TTL_MEDIUM) {
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      Logger.debug(`[PerfOptSvc] Cache hit for key: ${key}`);
      return cached.data;
    }

    Logger.debug(`[PerfOptSvc] Cache miss for key: ${key}`);
    const data = await fetcher();

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl * 1000,
    });

    return data;
  }

  /**
   * Invalidate cache entry
   * @param {string} key - Cache key to invalidate
   */
  invalidateCache(key) {
    this.cache.delete(key);
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param {string} pattern - Pattern to match (prefix)
   */
  invalidateCachePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Optimize query options for pagination
   * @param {Object} options - Query options
   * @returns {Object} Optimized options
   */
  optimizeQueryOptions(options = {}) {
    // Parse page with validation
    let page = parseInt(options.page, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    // Parse limit with validation and capping
    let limit = parseInt(options.limit, 10);
    if (isNaN(limit) || limit < 1) {
      limit = PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE;
    } else if (limit > PERFORMANCE_CONFIG.MAX_PAGE_SIZE) {
      limit = PERFORMANCE_CONFIG.MAX_PAGE_SIZE;
    }

    // Spread options first, then override with validated values
    const { page: _p, limit: _l, ...restOptions } = options;
    return {
      ...restOptions,
      page,
      limit,
      lean: true, // Always use lean for read operations
    };
  }

  /**
   * Build optimized geospatial query
   * @param {Object} bounds - Geographic bounds
   * @param {Object} additionalFilters - Additional query filters
   * @returns {Object} Optimized query object
   */
  buildGeospatialQuery(bounds, additionalFilters = {}) {
    const query = {
      location: {
        $geoWithin: {
          $box: [
            [bounds.minLng, bounds.minLat],
            [bounds.maxLng, bounds.maxLat],
          ],
        },
      },
      isDeleted: false,
      ...additionalFilters,
    };

    return query;
  }

  /**
   * Measure execution time of an async function
   * @param {string} label - Label for logging
   * @param {Function} fn - Async function to measure
   * @returns {Promise<any>} Function result
   */
  async measureTime(label, fn) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;

      if (duration > PERFORMANCE_CONFIG.MAX_RESPONSE_TIME_MS) {
        Logger.warn(
          `[PerfOptSvc] Slow operation: ${label} took ${duration}ms (target: ${PERFORMANCE_CONFIG.MAX_RESPONSE_TIME_MS}ms)`
        );
      } else {
        Logger.debug(`[PerfOptSvc] ${label} completed in ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      Logger.error(`[PerfOptSvc] ${label} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Current performance metrics
   */
  getMetrics() {
    return {
      cacheSize: this.cache.size,
      activeProcesses: this.activeProcesses,
      queueLength: this.processingQueue.length,
    };
  }
}

// Export singleton instance
export const performanceOptimizationService =
  new PerformanceOptimizationService();
