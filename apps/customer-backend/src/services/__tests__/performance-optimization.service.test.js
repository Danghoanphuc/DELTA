// apps/customer-backend/src/services/__tests__/performance-optimization.service.test.js
/**
 * Tests for Performance Optimization Service
 *
 * **Feature: delivery-checkin-system, Property 42: Parallel Photo Processing**
 * **Validates: Requirements 11.6, 12.1, 12.5**
 */

import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import {
  PerformanceOptimizationService,
  PERFORMANCE_CONFIG,
} from "../performance-optimization.service.js";

describe("PerformanceOptimizationService", () => {
  let service;

  beforeEach(() => {
    service = new PerformanceOptimizationService();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe("processInParallel", () => {
    /**
     * **Feature: delivery-checkin-system, Property 42: Parallel Photo Processing**
     * **Validates: Requirements 11.6**
     */
    it("should process items in parallel with concurrency control", async () => {
      const items = [1, 2, 3, 4, 5];
      const processedOrder = [];

      const processor = async (item) => {
        processedOrder.push(item);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return item * 2;
      };

      const results = await service.processInParallel(items, processor, {
        maxConcurrent: 2,
      });

      expect(results).toHaveLength(5);
      expect(results.filter((r) => r.success)).toHaveLength(5);
      expect(results.map((r) => r.data)).toEqual([2, 4, 6, 8, 10]);
    });

    it("should handle errors in individual items without failing all", async () => {
      const items = [1, 2, 3, 4, 5];

      const processor = async (item) => {
        if (item === 3) {
          throw new Error("Test error");
        }
        return item * 2;
      };

      const results = await service.processInParallel(items, processor);

      expect(results).toHaveLength(5);
      expect(results.filter((r) => r.success)).toHaveLength(4);
      expect(results.filter((r) => !r.success)).toHaveLength(1);
      expect(results[2].success).toBe(false);
      expect(results[2].error).toBe("Test error");
    });

    it("should call progress callback", async () => {
      const items = [1, 2, 3];
      const progressCalls = [];

      const processor = async (item) => item;
      const onProgress = (completed, total) => {
        progressCalls.push({ completed, total });
      };

      await service.processInParallel(items, processor, { onProgress });

      expect(progressCalls).toHaveLength(3);
      expect(progressCalls[progressCalls.length - 1]).toEqual({
        completed: 3,
        total: 3,
      });
    });

    it("should return empty array for empty input", async () => {
      const results = await service.processInParallel([], async (x) => x);
      expect(results).toEqual([]);
    });

    it("should timeout long-running operations", async () => {
      const items = [1];

      const processor = async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return "done";
      };

      const results = await service.processInParallel(items, processor, {
        timeout: 100,
      });

      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain("timed out");
    });
  });

  describe("processInBatches", () => {
    it("should process items in batches", async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const batches = [];

      const batchProcessor = async (batch) => {
        batches.push(batch);
        return batch.map((x) => x * 2);
      };

      const results = await service.processInBatches(items, batchProcessor, 3);

      expect(batches).toHaveLength(4);
      expect(batches[0]).toEqual([1, 2, 3]);
      expect(batches[1]).toEqual([4, 5, 6]);
      expect(batches[2]).toEqual([7, 8, 9]);
      expect(batches[3]).toEqual([10]);
      expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    });
  });

  describe("getCached", () => {
    it("should cache and return data", async () => {
      let fetchCount = 0;
      const fetcher = async () => {
        fetchCount++;
        return { data: "test" };
      };

      const result1 = await service.getCached("test-key", fetcher);
      const result2 = await service.getCached("test-key", fetcher);

      expect(result1).toEqual({ data: "test" });
      expect(result2).toEqual({ data: "test" });
      expect(fetchCount).toBe(1); // Should only fetch once
    });

    it("should respect TTL", async () => {
      let fetchCount = 0;
      const fetcher = async () => {
        fetchCount++;
        return { data: "test" };
      };

      await service.getCached("test-key", fetcher, 0.1); // 100ms TTL

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      await service.getCached("test-key", fetcher, 0.1);

      expect(fetchCount).toBe(2); // Should fetch twice after TTL expires
    });
  });

  describe("invalidateCache", () => {
    it("should invalidate specific cache entry", async () => {
      let fetchCount = 0;
      const fetcher = async () => {
        fetchCount++;
        return { data: "test" };
      };

      await service.getCached("test-key", fetcher);
      service.invalidateCache("test-key");
      await service.getCached("test-key", fetcher);

      expect(fetchCount).toBe(2);
    });

    it("should invalidate cache entries by pattern", async () => {
      await service.getCached("prefix:key1", async () => "value1");
      await service.getCached("prefix:key2", async () => "value2");
      await service.getCached("other:key3", async () => "value3");

      service.invalidateCachePattern("prefix:");

      let fetchCount = 0;
      await service.getCached("prefix:key1", async () => {
        fetchCount++;
        return "new1";
      });
      await service.getCached("other:key3", async () => {
        fetchCount++;
        return "new3";
      });

      expect(fetchCount).toBe(1); // Only prefix:key1 should be re-fetched
    });
  });

  describe("optimizeQueryOptions", () => {
    it("should set default values", () => {
      const options = service.optimizeQueryOptions({});

      expect(options.page).toBe(1);
      expect(options.limit).toBe(PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE);
      expect(options.lean).toBe(true);
    });

    it("should cap limit to max", () => {
      const options = service.optimizeQueryOptions({ limit: 1000 });

      expect(options.limit).toBe(PERFORMANCE_CONFIG.MAX_PAGE_SIZE);
    });

    it("should handle invalid values", () => {
      const options = service.optimizeQueryOptions({
        page: -1,
        limit: "invalid",
      });

      expect(options.page).toBe(1);
      expect(options.limit).toBe(PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE);
    });
  });

  describe("buildGeospatialQuery", () => {
    it("should build correct geospatial query", () => {
      const bounds = {
        minLng: 106.6,
        minLat: 10.7,
        maxLng: 106.8,
        maxLat: 10.9,
      };

      const query = service.buildGeospatialQuery(bounds);

      expect(query.location.$geoWithin.$box).toEqual([
        [106.6, 10.7],
        [106.8, 10.9],
      ]);
      expect(query.isDeleted).toBe(false);
    });

    it("should include additional filters", () => {
      const bounds = {
        minLng: 106.6,
        minLat: 10.7,
        maxLng: 106.8,
        maxLat: 10.9,
      };

      const query = service.buildGeospatialQuery(bounds, {
        customerId: "123",
      });

      expect(query.customerId).toBe("123");
    });
  });

  describe("measureTime", () => {
    it("should measure execution time", async () => {
      const result = await service.measureTime("test-operation", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return "done";
      });

      expect(result).toBe("done");
    });

    it("should throw errors from measured function", async () => {
      await expect(
        service.measureTime("test-operation", async () => {
          throw new Error("Test error");
        })
      ).rejects.toThrow("Test error");
    });
  });

  describe("getMetrics", () => {
    it("should return current metrics", async () => {
      await service.getCached("key1", async () => "value1");
      await service.getCached("key2", async () => "value2");

      const metrics = service.getMetrics();

      expect(metrics.cacheSize).toBe(2);
      expect(metrics.activeProcesses).toBe(0);
      expect(metrics.queueLength).toBe(0);
    });
  });
});
